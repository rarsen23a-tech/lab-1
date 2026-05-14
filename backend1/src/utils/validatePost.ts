type PostInput = {
    title?: unknown;
    content?: unknown;
    userId?: unknown;
};

export const validatePost = (
    data: PostInput,
    isCreate: boolean = true
): string[] => {
    const errors: string[] = [];

    const title = data.title;
    const content = data.content;
    const userId = data.userId;

    if (typeof title !== 'string' || !title.trim()) {
        errors.push('Title is required');
    }

    if (typeof content !== 'string' || !content.trim()) {
        errors.push('Content is required');
    }

    if (isCreate) {
        const parsedUserId = Number(userId);

        if (!userId || Number.isNaN(parsedUserId)) {
            errors.push('UserId must be a valid number');
        }
    }

    return errors;
};