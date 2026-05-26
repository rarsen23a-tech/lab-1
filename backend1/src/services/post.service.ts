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
    sortBy?: 'id' | 'userId' | 'title';
    order?: 'asc' | 'desc';
};

const toId = (id: number | string) => Number(id);

export const getAll = async (query?: GetAllQuery) => {
  let items = await postRepository.getAll();

    if (query?.userId !== undefined) {
        const userId = Number(query.userId);
        if (Number.isNaN(userId)) {
            throw new AppError(400, 'Invalid userId filter');
        }
        items = items.filter(post => post.userId === userId);
    }

    if (query?.sortBy) {
        const order = query.order === 'desc' ? -1 : 1;
        items.sort((a, b) => {
            const key = query.sortBy as keyof typeof a;
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
    const paginatedItems = items.slice(start, end);
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;

    return { items: paginatedItems, total, page, pageSize, totalPages, hasNext };
};

export const getById = async (id: number | string) => {
    const postId = toId(id);
    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }
    const post = await postRepository.getById(postId);
    if (!post) {
        throw new AppError(404, 'Post not found');
    }
    return post;
};

export const create = async (data: CreatePostDto) => {
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
    return await postRepository.create({ title, content, userId });
};

export const update = async (id: number | string, data: UpdatePostDto) => {
    const postId = toId(id);
    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }
    const post = await postRepository.update(postId, {
        title: data.title?.trim(),
        content: data.content?.trim()
    });
    if (!post) {
        throw new AppError(404, 'Post not found');
    }
    return post;
};

export const remove = async (id: number | string) => {
    const postId = toId(id);
    if (Number.isNaN(postId)) {
        throw new AppError(400, 'Invalid id');
    }
    const ok = await postRepository.remove(postId);
    if (!ok) {
        throw new AppError(404, 'Post not found');
    }
    return { success: true };
};
