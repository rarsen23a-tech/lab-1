import * as postRepository from '../repositories/post.repository';
import AppError from '../utils/AppError';

type CreatePostDto = {
    title: string;
    content: string;
    userId: number;
};

type UpdatePostDto = {
    title?: string;
    content?: string;
};

type GetAllQuery = {
    page?: number;
    pageSize?: number;
    userId?: number;
};

const toId = (id: number | string) => Number(id);

export const getAll = (query?: GetAllQuery) => {
    let items = postRepository.getAll();


    if (query?.userId !== undefined) {
        const userId = Number(query.userId);

        if (Number.isNaN(userId)) {
            throw new AppError(400, 'Invalid userId filter');
        }

        items = items.filter(post => post.userId === userId);
    }

    
    const page = Number(query?.page || 1);
    const pageSize = Number(query?.pageSize || 10);

    if (page <= 0 || pageSize <= 0) {
        throw new AppError(400, 'Invalid pagination params');
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const paginatedItems = items.slice(start, end);
    const total = items.length;

    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;

    return {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
        hasNext
    };
};

export const getById = (id: number | string) => {
    const postId = toId(id);

    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }

    const post = postRepository.getById(postId);

    if (!post) {
        throw new AppError(404, 'Post not found');
    }

    return post;
};

export const create = (data: CreatePostDto) => {
    const title = data.title?.trim();
    const content = data.content?.trim();
    const userId = Number(data.userId);

    const errors: string[] = [];

    if (!title) errors.push('Title is required');
    if (!content) errors.push('Content is required');
    if (Number.isNaN(userId)) errors.push('UserId must be a number');

    if (errors.length) {
        throw new AppError(400, 'Invalid post data', errors);
    }

    return postRepository.create({
        title,
        content,
        userId
    });
};

export const update = (id: number | string, data: UpdatePostDto) => {
    const postId = toId(id);

    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }

    const post = postRepository.update(postId, {
        title: data.title?.trim(),
        content: data.content?.trim()
    });

    if (!post) {
        throw new AppError(404, 'Post not found');
    }

    return post;
};

export const remove = (id: number | string) => {
    const postId = toId(id);

    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }

    const ok = postRepository.remove(postId);

    if (!ok) {
        throw new AppError(404, 'Post not found');
    }

    return { success: true };
};