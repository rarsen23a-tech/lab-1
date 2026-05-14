type Comment = {
    id?: unknown;
    userName?: unknown;
    content?: unknown;
};

class CommentResponseDto {
    public id: number | null;
    public userName: string;
    public content: string;

    constructor({ id, userName, content }: Comment) {
        this.id =
            typeof id === 'number'
                ? id
                : null;

        this.userName =
            typeof userName === 'string'
                ? userName
                : '';

        this.content =
            typeof content === 'string'
                ? content
                : '';
    }
}

export default CommentResponseDto;