type CreatePostRequest = {
    title?: unknown;
    content?: unknown;
    category?: unknown;
    userId?: unknown;
};

class CreatePostRequestDto {
    public title: string;
    public content: string;
    public category: string | undefined;
    public userId: number;

    constructor(data: CreatePostRequest) {
        this.title = typeof data.title === 'string' ? data.title.trim() : '';
        this.content = typeof data.content === 'string' ? data.content.trim() : '';
        this.category = typeof data.category === 'string' ? data.category.trim() : undefined;
        this.userId = typeof data.userId === 'number' ? data.userId : Number(data.userId);
    }
}

export default CreatePostRequestDto;
