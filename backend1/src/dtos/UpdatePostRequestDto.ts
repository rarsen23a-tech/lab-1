type UpdatePostRequest = {
    title?: unknown;
    content?: unknown;
    category?: unknown;
};

class UpdatePostRequestDto {
    public title?: string;
    public content?: string;
    public category?: string;

    constructor(data: UpdatePostRequest = {}) {
        this.title = typeof data.title === 'string' ? data.title.trim() : undefined;
        this.content = typeof data.content === 'string' ? data.content.trim() : undefined;
        this.category = typeof data.category === 'string' ? data.category.trim() : undefined;
    }
}

export default UpdatePostRequestDto;
