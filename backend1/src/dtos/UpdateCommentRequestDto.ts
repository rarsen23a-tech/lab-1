type UpdateCommentRequest = {
    userName?: unknown;
    content?: unknown;
};

class UpdateCommentRequestDto {
    public userName?: string;
    public content?: string;

    constructor({ userName, content }: UpdateCommentRequest = {}) {
        this.userName =
            typeof userName === 'string'
                ? userName.trim()
                : undefined;

        this.content =
            typeof content === 'string'
                ? content.trim()
                : undefined;
    }
}

export default UpdateCommentRequestDto;