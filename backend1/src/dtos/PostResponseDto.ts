type Post = {
    id?: unknown;
    title?: unknown;
    content?: unknown;
    userId?: unknown;
    createdAt?: unknown;
};

class PostResponseDto {
    public id: number;
    public title: string;
    public content: string;
    public userId: number;
    public createdAt: string;

    constructor(post: Post = {}) {
        this.id = typeof post.id === 'number' ? post.id : 0;
        this.title = typeof post.title === 'string' ? post.title : '';
        this.content = typeof post.content === 'string' ? post.content : '';
        this.userId = typeof post.userId === 'number' ? post.userId : 0;
        this.createdAt = typeof post.createdAt === 'string' ? post.createdAt : '';
    }
}

export default PostResponseDto;
