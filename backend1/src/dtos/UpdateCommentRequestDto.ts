type UpdateCommentRequest = {
    text?: unknown;
};

class UpdateCommentRequestDto {
    public text?: string;

    constructor(data: UpdateCommentRequest = {}) {
        this.text = typeof data.text === 'string' ? data.text.trim() : undefined;
    }
}

export default UpdateCommentRequestDto;
