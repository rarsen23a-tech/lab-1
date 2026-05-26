type CreateCommentRequest = {
    postId?: unknown;
    userId?: unknown;
    text?: unknown;
};

class CreateCommentRequestDto {
    public postId: number;
    public userId: number;
    public text: string;

    constructor(data: CreateCommentRequest) {
        this.postId = typeof data.postId === 'number' ? data.postId : Number(data.postId);
        this.userId = typeof data.userId === 'number' ? data.userId : Number(data.userId);
        this.text = typeof data.text === 'string' ? data.text.trim() : '';
    }
}

export default CreateCommentRequestDto;
