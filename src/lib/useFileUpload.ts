import { useState } from 'react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { ResultAsync } from 'neverthrow';

const FileSchema = z.object({
    type: z.string().refine(
        (type) => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav'].includes(type),
        'Invalid file type. Only MP3, WAV, OGG allowed.'
    ),
    size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB limit.'),
});

export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (
        file: File,
        trackId: string,
        onUploadFile: (id: string, file: File) => Promise<void>
    ) => {
        setUploading(true);

        const uploadResult = await ResultAsync.fromPromise(
            Promise.resolve(FileSchema.parseAsync({ type: file.type, size: file.size })),
            (zodError) => {
                if (zodError instanceof Error && "errors" in zodError) {
                    const errors = (zodError as { errors?: { message?: string }[] }).errors;
                    const first = errors && errors[0]?.message;
                    return first || 'Unknown file validation error.';
                }
                return 'Unknown file validation error.';
            }
        ).andThen(() => {
            return ResultAsync.fromPromise(
                onUploadFile(trackId, file),
                () => "File upload failed."
            );
        });

        uploadResult.match(
            () => {
            },
            (error) => {
                console.error("Upload failed:", error);
                toast.error(error);
            }
        );

        setUploading(false);
    };

    return { uploading, uploadFile };
};