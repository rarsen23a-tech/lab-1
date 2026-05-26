import { all, get, run } from '../db/dbClient';

type User = {
    id: number;
    name: string;
    email: string | null;
    createdAt: string;
};

type CreateUserInput = {
    name: string;
    email?: string;
};

type UpdateUserInput = {
    name?: string;
    email?: string;
};

export const getAll = async (): Promise<User[]> => {
    return await all<User>('SELECT id, name, email, createdAt FROM Users ORDER BY id DESC;');
};

export const getById = async (userId: number): Promise<User | undefined> => {
    return await get<User>(`SELECT id, name, email, createdAt FROM Users WHERE id = ${userId};`);
};

export const create = async (data: CreateUserInput): Promise<User> => {
    const name = data.name.trim().replace(/'/g, "''");
    const email = data.email ? `'${data.email.trim().replace(/'/g, "''")}'` : 'NULL';
    const createdAt = new Date().toISOString();

    const result = await run(`
        INSERT INTO Users (name, email, createdAt)
        VALUES ('${name}', ${email}, '${createdAt}');
    `);

    return (await getById(result.lastID))!;
};

export const update = async (userId: number, data: UpdateUserInput): Promise<User | null> => {
    const existing = await getById(userId);
    if (!existing) return null;

    const name = (data.name ?? existing.name).trim().replace(/'/g, "''");
    const email = data.email !== undefined
        ? (data.email ? `'${data.email.trim().replace(/'/g, "''")}'` : 'NULL')
        : (existing.email ? `'${existing.email}'` : 'NULL');

    const result = await run(`
        UPDATE Users
        SET name = '${name}', email = ${email}
        WHERE id = ${userId};
    `);

    if (result.changes === 0) return null;

    return (await getById(userId))!;
};

export const remove = async (userId: number): Promise<boolean> => {
    const result = await run(`DELETE FROM Users WHERE id = ${userId};`);
    return result.changes > 0;
};
