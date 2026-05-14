type CreateCommentRequest = {
    userName?: unknown;
    content?: unknown;
};

class CreateCommentRequestDto {
    public userName: string;
    public content: string;

    constructor({ userName, content }: CreateCommentRequest) {
        this.userName =
            typeof userName === 'string'
                ? userName.trim()
                : '';

        this.content =
            typeof content === 'string'
                ? content.trim()
                : '';
    }
}

export default CreateCommentRequestDto;