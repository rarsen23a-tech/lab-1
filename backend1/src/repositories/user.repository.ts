import { all, get, run } from '../db/dbClient';

type User = {
    id: number;
    name: string;
    email: string | null;
    username: string | null;
    role: string | null;
    createdAt: string;
};

type CreateUserInput = {
    name: string;
    email?: string;
    username?: string;
    role?: string;
};

type UpdateUserInput = {
    name?: string;
    email?: string;
    username?: string;
    role?: string;
};

export const getAll = async (): Promise<User[]> => {
    return await all<User>('SELECT id, name, email, username, role, createdAt FROM Users ORDER BY id DESC;');
};

export const getById = async (userId: number): Promise<User | undefined> => {
    return await get<User>('SELECT id, name, email, username, role, createdAt FROM Users WHERE id = ?;', [userId]);
};

export const create = async (data: CreateUserInput): Promise<User> => {
    const createdAt = new Date().toISOString();
    const result = await run(
        'INSERT INTO Users (name, email, username, role, createdAt) VALUES (?, ?, ?, ?, ?);',
        [data.name.trim(), data.email ?? null, data.username ?? null, data.role ?? null, createdAt]
    );
    return (await getById(result.lastID))!;
};

export const update = async (userId: number, data: UpdateUserInput): Promise<User | null> => {
    const existing = await getById(userId);
    if (!existing) return null;

    const result = await run(
        'UPDATE Users SET name = ?, email = ?, username = ?, role = ? WHERE id = ?;',
        [
            (data.name ?? existing.name).trim(),
            data.email !== undefined ? (data.email || null) : existing.email,
            data.username !== undefined ? (data.username || null) : existing.username,
            data.role !== undefined ? (data.role || null) : existing.role,
            userId
        ]
    );

    if (result.changes === 0) return null;
    return (await getById(userId))!;
};

export const remove = async (userId: number): Promise<boolean> => {
    const result = await run('DELETE FROM Users WHERE id = ?;', [userId]);
    return result.changes > 0;
};
