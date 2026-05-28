import { all, get, run } from '../db/dbClient';

type Post = {
    id: number;
    title: string;
    content: string;
    category: string | null;
    userId: number;
    createdAt: string;
};

type CreatePostInput = {
    title: string;
    content: string;
    category?: string;
    userId: number;
};

type UpdatePostInput = {
    title?: string;
    content?: string;
    category?: string;
};

export const getAll = async (): Promise<Post[]> => {
    return await all<Post>('SELECT id, title, content, category, userId, createdAt FROM Posts ORDER BY id DESC;');
};

export const getById = async (postId: number): Promise<Post | undefined> => {
    return await get<Post>('SELECT id, title, content, category, userId, createdAt FROM Posts WHERE id = ?;', [postId]);
};

export const create = async (data: CreatePostInput): Promise<Post> => {
    const createdAt = new Date().toISOString();
    const result = await run(
        'INSERT INTO Posts (title, content, category, userId, createdAt) VALUES (?, ?, ?, ?, ?);',
        [data.title.trim(), data.content.trim(), data.category ?? null, Number(data.userId), createdAt]
    );
    return (await getById(result.lastID))!;
};

export const update = async (postId: number, data: UpdatePostInput): Promise<Post | null> => {
    const existing = await getById(postId);
    if (!existing) return null;

    const result = await run(
        'UPDATE Posts SET title = ?, content = ?, category = ? WHERE id = ?;',
        [
            (data.title ?? existing.title).trim(),
            (data.content ?? existing.content).trim(),
            data.category !== undefined ? (data.category || null) : existing.category,
            postId
        ]
    );

    if (result.changes === 0) return null;
    return (await getById(postId))!;
};

export const remove = async (postId: number): Promise<boolean> => {
    const result = await run('DELETE FROM Posts WHERE id = ?;', [postId]);
    return result.changes > 0;
};
