export interface Paste {
    paste_title?: string;
    paste_content: string;
}

export interface PasteFullDetails extends Paste {
    date: string;
    id: number;
}