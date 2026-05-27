import * as repo from '../repositories/user.repository';
import AppError from '../utils/AppError';

type UpdateUserInput = {
    name?: string;
    email?: string;
    username?: string;
    role?: string;
};

type GetAllQuery = {
    page?: number;
    pageSize?: number;
    sortBy?: 'id' | 'name';
    order?: 'asc' | 'desc';
};

export const getAll = async (query?: GetAllQuery) => {
    const users = await repo.getAll();

    if (query?.sortBy) {
        const order = query.order === 'desc' ? -1 : 1;
        users.sort((a, b) => {
            const key = query.sortBy as keyof typeof a;
            const aVal = a[key];
            const bVal = b[key];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * order;
            }
            if (aVal == null || bVal == null) return 0;
            return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * order;
        });
    }

    const page = Number(query?.page || 1);
    const pageSize = Number(query?.pageSize || 10);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = users.slice(start, end);

    return {
        items: paginatedItems,
        total: users.length,
        page,
        pageSize,
        totalPages: Math.ceil(users.length / pageSize),
        hasNext: page < Math.ceil(users.length / pageSize)
    };
};

export const getById = async (id: number | string) => {
    const userId = Number(id);
    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }
    const user = await repo.getById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    return user;
};

export const create = async (data: { name: string; email?: string; username?: string; role?: string }) => {
    const errors: string[] = [];
    const name = data.name;

    if (typeof name !== 'string' || !name.trim()) {
        errors.push('Name is required');
    }
    if (data.email !== undefined && typeof data.email !== 'string') {
        errors.push('Email must be a string');
    }
    if (data.username !== undefined && (typeof data.username !== 'string' || data.username.trim().length < 3)) {
        errors.push('Username must be at least 3 characters');
    }
    if (data.role !== undefined && !['user', 'admin', 'moderator'].includes(data.role)) {
        errors.push('Role must be user, admin or moderator');
    }
    if (errors.length) {
        throw new AppError(400, 'Invalid request body', errors);
    }

    return await repo.create({
        name: name.trim(),
        email: data.email,
        username: data.username,
        role: data.role
    });
};

export const update = async (id: number | string, data: UpdateUserInput) => {
    const userId = Number(id);
    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }

    const errors: string[] = [];
    if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) {
        errors.push('Name cannot be empty');
    }
    if (data.username !== undefined && (typeof data.username !== 'string' || data.username.trim().length < 3)) {
        errors.push('Username must be at least 3 characters');
    }
    if (data.role !== undefined && !['user', 'admin', 'moderator'].includes(data.role)) {
        errors.push('Role must be user, admin or moderator');
    }
    if (errors.length) {
        throw new AppError(400, 'Invalid request body', errors);
    }

    const updated = await repo.update(userId, {
        name: data.name?.trim(),
        email: data.email,
        username: data.username,
        role: data.role
    });

    if (!updated) {
        throw new AppError(404, 'User not found');
    }

    return updated;
};

export const remove = async (id: number | string): Promise<boolean> => {
    const userId = Number(id);
    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }
    const ok = await repo.remove(userId);
    if (!ok) {
        throw new AppError(404, 'User not found');
    }
    return true;
};
