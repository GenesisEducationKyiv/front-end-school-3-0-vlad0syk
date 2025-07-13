import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { ApiErrorSchema } from '../../types.ts';

export const API_BASE_URL = 'http://localhost:8000';

async function parseErrorResponse(response: Response): Promise<{ message: string; details: unknown }> {
    let errorDetails: unknown = { error: `HTTP error! status: ${response.status}` };
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;

    const errorHasBody = response.headers.get('content-length') !== '0' && response.headers.get('content-type')?.includes('application/json');

    if (errorHasBody) {
        try {
            const jsonError = await response.json();
            const parsedApiError = ApiErrorSchema.safeParse(jsonError);

            if (parsedApiError.success) {
                errorDetails = parsedApiError.data;
                errorMessage = parsedApiError.data.error || parsedApiError.data.error || errorMessage;
            } else {
                errorDetails = { error: JSON.stringify(jsonError) || `HTTP error! status: ${response.status}` };
                errorMessage = JSON.stringify(jsonError) || `HTTP error! status: ${response.status}`;
            }
        } catch (jsonParseError) {
            errorDetails = { error: `HTTP error! status: ${response.status}. Could not parse error response.` };
            errorMessage = `HTTP error! status: ${response.status}. Could not parse error response.`;
            console.warn("Failed to parse error response as JSON:", jsonParseError);
        }
    } else {
        errorDetails = { error: `HTTP error! status: ${response.status}. No JSON error body.` };
        errorMessage = `HTTP error! status: ${response.status}. No JSON error body.`;
    }
    console.error('API Error:', response.status, errorDetails);
    return { message: errorMessage, details: errorDetails };
}

async function handleVoidResponse(response: Response): Promise<Result<void, Error>> {
    const contentLength = response.headers.get('content-length');
    const isResponseEmpty = response.status === 204 || (contentLength !== null && parseInt(contentLength) === 0);
    const isContentTypeJson = response.headers.get('content-type')?.includes('application/json');

    if (isResponseEmpty) {
        return ok(undefined);
    } else {
        let rawData: unknown;
        try {
            if (isContentTypeJson) {
                rawData = await response.json();
                if (typeof rawData === 'object' && rawData !== null && Object.keys(rawData).length === 0) {
                    return ok(undefined);
                }
            } else {
                const textData = await response.text();
                if (textData.trim() === '') {
                    return ok(undefined);
                }
                return err(new Error(`Expected empty response for void schema, but got non-JSON text: ${textData}`));
            }
        } catch (e) {
            return err(new Error(`Expected void response, but got invalid content or parsing error: ${e}`));
        }
        console.error('Expected void response, but got unexpected non-empty data for void schema:', rawData);
        return err(new Error(`Expected void response, but got unexpected data: ${JSON.stringify(rawData)}`));
    }
}

async function parseJsonResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<Result<T, Error>> {
    const isContentTypeJson = response.headers.get('content-type')?.includes('application/json');
    const contentLength = response.headers.get('content-length');
    const isResponseEmpty = response.status === 204 || (contentLength !== null && parseInt(contentLength) === 0);

    if (isResponseEmpty) {
        return err(new Error('API returned an empty response when data was expected.'));
    }

    if (!isContentTypeJson) {
        const rawText = await response.text();
        return err(new Error(`Expected JSON response, but got content type '${response.headers.get('content-type') || 'none'}'. Raw content: ${rawText.substring(0, 100)}...`));
    }

    const rawData: unknown = await response.json();
    const parsedData = schema.safeParse(rawData);

    if (!parsedData.success) {
        console.error('Data parsing error:', parsedData.error);
        return err(new Error(`Failed to parse API response: ${parsedData.error.message}`));
    }

    return ok(parsedData.data);
}

export async function handleResponseWithZod<T>(
    response: Response,
    schema: z.ZodSchema<T>
): Promise<Result<T, Error>> {
    try {
        if (!response.ok) {
            const { message } = await parseErrorResponse(response);
            return err(new Error(message));
        }

        if (schema instanceof z.ZodVoid) {
            const voidResult = await handleVoidResponse(response);
            return voidResult as Result<T, Error>;
        }

        return parseJsonResponse(response, schema);

    } catch (e: unknown) {
        console.error('Network or unexpected API error in catch block:', e);
        if (e instanceof Error) {
            return err(e);
        }
        return err(new Error('An unknown error occurred during API call.'));
    }
}