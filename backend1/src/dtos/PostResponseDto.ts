type Post = {
    id?: unknown;
    title?: unknown;
    content?: unknown;
};

class PostResponseDto {
    public id: number;
    public title: string;
    public content: string;

    constructor(post: Post = {}) {
        this.id =
            typeof post.id === 'number'
                ? post.id
                : 0;

        this.title =
            typeof post.title === 'string'
                ? post.title
                : '';

        this.content =
            typeof post.content === 'string'
                ? post.content
                : '';
    }
}

export default PostResponseDto;