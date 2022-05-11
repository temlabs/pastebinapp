export interface Paste {
    paste_title?: string;
    paste_content: string;
}

export interface PasteFullDetails extends Paste {
    date: string;
    id: number;
}


export interface Comment {
    comment_content: string;
}

export interface CommentFullDetails extends Paste {
    comment_date: string;
    comment_id: number;
    paste_id: number;
}