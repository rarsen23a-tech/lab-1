import * as commentRepository from '../repositories/comment.repository';
import AppError from '../utils/AppError';

type Comment = {
    id: number;
    postId: number;
    userId: number;
    text: string;
};

type CreateCommentDto = {
    postId: number;
    userId: number;
    text: string;
};

type UpdateCommentDto = {
    text?: string;
};

type GetAllQuery = {
    page?: number;
    pageSize?: number;
    postId?: number;
    sortBy?: 'id' | 'postId' | 'userId';
    order?: 'asc' | 'desc';
};

export const getAll = (query?: GetAllQuery) => {
    let comments = commentRepository.findAll();

    if (query?.postId !== undefined) {
        const postId = Number(query.postId);

        if (Number.isNaN(postId)) {
            throw new AppError(400, 'Invalid postId filter');
        }

        comments = comments.filter(c => c.postId === postId);
    }

  
    if (query?.sortBy) {
        const order = query.order === 'desc' ? -1 : 1;

        comments.sort((a, b) => {
            const key = query.sortBy as keyof Comment;

            const aVal = a[key];
            const bVal = b[key];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * order;
            }

            return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * order;
        });
    }

    const page = Number(query?.page || 1);
    const pageSize = Number(query?.pageSize || 10);

    if (page <= 0 || pageSize <= 0) {
        throw new AppError(400, 'Invalid pagination params');
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const items = comments.slice(start, end);
    const total = comments.length;

    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;

    return {
        items,
        total,
        page,
        limit: pageSize,
        totalPages,
        hasNext
    };
};

export const getById = (id: number | string): Comment => {
    const comment = commentRepository.findById(Number(id));

    if (!comment) {
        throw new AppError(404, 'Comment not found');
    }

    return comment;
};

export const create = (data: CreateCommentDto): Comment => {
    const postId = Number(data.postId);
    const userId = Number(data.userId);
    const text = data.text?.trim();

    const errors: string[] = [];

    if (Number.isNaN(postId)) errors.push('postId must be a number');
    if (Number.isNaN(userId)) errors.push('userId must be a number');
    if (!text) errors.push('Text is required');

    if (errors.length) {
        throw new AppError(400, 'Invalid request body', errors);
    }

    return commentRepository.create({
        postId,
        userId,
        text
    });
};

export const update = (id: number | string, data: UpdateCommentDto): Comment => {
    const commentId = Number(id);

    if (Number.isNaN(commentId)) {
        throw new AppError(400, 'Invalid id');
    }

    const text = data.text?.trim();

    if (data.text !== undefined && !text) {
        throw new AppError(400, 'Text cannot be empty');
    }

    const updated = commentRepository.update(commentId, {
        text
    });

    if (!updated) {
        throw new AppError(404, 'Comment not found');
    }

    return updated;
};

export const remove = (id: number | string) => {
    const commentId = Number(id);

    if (Number.isNaN(commentId)) {
        throw new AppError(400, 'Invalid id');
    }

    const success = commentRepository.remove(commentId);

    if (!success) {
        throw new AppError(404, 'Comment not found');
    }

    return { message: 'Deleted successfully' };
};
