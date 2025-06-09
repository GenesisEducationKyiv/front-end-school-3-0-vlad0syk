export function isValidUrl(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}