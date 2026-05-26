import { all, get, run } from '../db/dbClient';

type Comment = {
    id: number;
    postId: number;
    userId: number;
    text: string;
    createdAt: string;
};

type CreateCommentInput = {
    postId: number;
    userId: number;
    text: string;
};

type UpdateCommentInput = {
    text?: string;
};

export const findAll = async (): Promise<Comment[]> => {
    return await all<Comment>('SELECT id, postId, userId, text, createdAt FROM Comments ORDER BY id DESC;');
};

export const findById = async (commentId: number): Promise<Comment | undefined> => {
    return await get<Comment>(`SELECT id, postId, userId, text, createdAt FROM Comments WHERE id = ${commentId};`);
};

export const create = async (data: CreateCommentInput): Promise<Comment> => {
    const text = data.text.trim().replace(/'/g, "''");
    const postId = Number(data.postId);
    const userId = Number(data.userId);
    const createdAt = new Date().toISOString();

    const result = await run(`
        INSERT INTO Comments (postId, userId, text, createdAt)
        VALUES (${postId}, ${userId}, '${text}', '${createdAt}');
    `);

    return (await findById(result.lastID))!;
};

export const update = async (commentId: number, data: UpdateCommentInput): Promise<Comment | null> => {
    const existing = await findById(commentId);
    if (!existing) return null;

    const text = (data.text ?? existing.text).trim().replace(/'/g, "''");

    const result = await run(`
        UPDATE Comments
        SET text = '${text}'
        WHERE id = ${commentId};
    `);

    if (result.changes === 0) return null;

    return (await findById(commentId))!;
};

export const remove = async (commentId: number): Promise<boolean> => {
    const result = await run(`DELETE FROM Comments WHERE id = ${commentId};`);
    return result.changes > 0;
};
