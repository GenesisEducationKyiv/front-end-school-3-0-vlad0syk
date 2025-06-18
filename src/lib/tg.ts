export function isHTMLAudioElement(element: EventTarget | null): element is HTMLAudioElement {
    return element instanceof HTMLAudioElement;
}