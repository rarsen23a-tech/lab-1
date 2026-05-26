type Comment = {
    id?: unknown;
    postId?: unknown;
    userId?: unknown;
    text?: unknown;
    createdAt?: unknown;
};

class CommentResponseDto {
    public id: number;
    public postId: number;
    public userId: number;
    public text: string;
    public createdAt: string;

    constructor(comment: Comment = {}) {
        this.id = typeof comment.id === 'number' ? comment.id : 0;
        this.postId = typeof comment.postId === 'number' ? comment.postId : 0;
        this.userId = typeof comment.userId === 'number' ? comment.userId : 0;
        this.text = typeof comment.text === 'string' ? comment.text : '';
        this.createdAt = typeof comment.createdAt === 'string' ? comment.createdAt : '';
    }
}

export default CommentResponseDto;
