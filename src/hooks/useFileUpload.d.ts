// Type definitions for useFileUpload hook

declare const useFileUpload: () => {
  uploading: boolean;
  uploadFile: (file: File, trackId: string, onUpload: (file: File) => Promise<unknown>) => Promise<unknown>;
};

export { useFileUpload };
