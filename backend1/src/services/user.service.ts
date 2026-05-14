import * as repo from '../repositories/user.repository';
import AppError from '../utils/AppError';

type User = {
    id: number;
    name: string;
};

type CreateUserInput = {
    name: string;
};

type UpdateUserInput = {
    name?: string;
};

type GetAllQuery = {
    page?: number;
    pageSize?: number;
    sortBy?: 'id' | 'name';
    order?: 'asc' | 'desc';
};

export const getAll = (query?: GetAllQuery) => {
    const users = [...repo.getAll()]; 

    if (query?.sortBy) {
        const order = query.order === 'desc' ? -1 : 1;

        users.sort((a, b) => {
            const key = query.sortBy as keyof User;

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

export const getById = (id: number | string): User => {
    const userId = Number(id);

    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }

    const user = repo.getById(userId);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    return user;
};

export const create = (data: CreateUserInput): User => {
    const errors: string[] = [];

    const name = data.name;

    if (typeof name !== 'string' || !name.trim()) {
        errors.push('Name is required');
    }

    if (errors.length) {
        throw new AppError(400, 'Invalid request body', errors);
    }

    return repo.create({
        name: name.trim()
    });
};

export const update = (id: number | string, data: UpdateUserInput): User => {
    const userId = Number(id);

    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }

    const name = data.name;

    const errors: string[] = [];

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        errors.push('Name cannot be empty');
    }

    if (errors.length) {
        throw new AppError(400, 'Invalid request body', errors);
    }

    const updated = repo.update(userId, {
        name: name?.trim()
    });

    if (!updated) {
        throw new AppError(404, 'User not found');
    }

    return updated;
};

export const remove = (id: number | string): boolean => {
    const userId = Number(id);

    if (Number.isNaN(userId)) {
        throw new AppError(400, 'Invalid id');
    }

    const ok = repo.remove(userId);

    if (!ok) {
        throw new AppError(404, 'User not found');
    }

    return true;
};
