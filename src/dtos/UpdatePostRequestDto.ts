type UpdatePostRequest = {
    title?: unknown;
    content?: unknown;
};

class UpdatePostRequestDto {
    public title?: string;
    public content?: string;

    constructor(data: UpdatePostRequest = {}) {
        this.title =
            typeof data.title === 'string'
                ? data.title.trim()
                : undefined;

        this.content =
            typeof data.content === 'string'
                ? data.content.trim()
                : undefined;
    }
}

export default UpdatePostRequestDto;