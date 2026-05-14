type CommentInput = {
    postId?: unknown;
    userId?: unknown;
    text?: unknown;
};

export const validateComment = (
    data: CommentInput,
    isCreate: boolean = true
): string[] => {
    const errors: string[] = [];

  
    if (isCreate) {
        if (typeof data.postId !== 'number' || Number.isNaN(data.postId)) {
            errors.push('PostId must be a number');
        }

        if (typeof data.userId !== 'number' || Number.isNaN(data.userId)) {
            errors.push('UserId must be a number');
        }

        if (typeof data.text !== 'string' || !data.text.trim()) {
            errors.push('Text is required');
        }
    }

  
    if (!isCreate) {
        if (
            data.text !== undefined &&
            (typeof data.text !== 'string' || !data.text.trim())
        ) {
            errors.push('Text cannot be empty');
        }
    }

    return errors;
};