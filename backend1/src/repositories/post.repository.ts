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
    return await get<Post>(`SELECT id, title, content, category, userId, createdAt FROM Posts WHERE id = ${postId};`);
};

export const create = async (data: CreatePostInput): Promise<Post> => {
    const title = data.title.trim().replace(/'/g, "''");
    const content = data.content.trim().replace(/'/g, "''");
    const category = data.category ? `'${data.category.trim().replace(/'/g, "''")}'` : 'NULL';
    const userId = Number(data.userId);
    const createdAt = new Date().toISOString();

    const result = await run(`
        INSERT INTO Posts (title, content, category, userId, createdAt)
        VALUES ('${title}', '${content}', ${category}, ${userId}, '${createdAt}');
    `);

    return (await getById(result.lastID))!;
};

export const update = async (postId: number, data: UpdatePostInput): Promise<Post | null> => {
    const existing = await getById(postId);
    if (!existing) return null;

    const title = (data.title ?? existing.title).trim().replace(/'/g, "''");
    const content = (data.content ?? existing.content).trim().replace(/'/g, "''");
    const category = data.category !== undefined
        ? (data.category ? `'${data.category.trim().replace(/'/g, "''")}'` : 'NULL')
        : (existing.category ? `'${existing.category}'` : 'NULL');

    const result = await run(`
        UPDATE Posts
        SET title = '${title}', content = '${content}', category = ${category}
        WHERE id = ${postId};
    `);

    if (result.changes === 0) return null;

    return (await getById(postId))!;
};

export const remove = async (postId: number): Promise<boolean> => {
    const result = await run(`DELETE FROM Posts WHERE id = ${postId};`);
    return result.changes > 0;
};
