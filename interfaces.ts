export interface Paste {
    title?: string;
    content: string;
}

export interface PasteFullDetails extends Paste {
    date: string;
    id: number;
}