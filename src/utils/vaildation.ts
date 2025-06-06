export function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch (e) {
        return false;
    }
}