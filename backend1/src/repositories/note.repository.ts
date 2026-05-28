import { all, get, run } from '../db/dbClient';

export type Note = {
    id: number;
    ownerUserId: number;
    title: string;
    body: string;
    createdAt: string;
};

type CreateNoteInput = {
    ownerUserId: number;
    title: string;
    body: string;
};

type UpdateNoteInput = {
    title?: string;
    body?: string;
};

export const getAll = async (ownerUserId: number): Promise<Note[]> => {
    return await all<Note>(
        'SELECT id, ownerUserId, title, body, createdAt FROM Notes WHERE ownerUserId = ? ORDER BY id DESC;',
        [ownerUserId]
    );
};

export const getById = async (noteId: number): Promise<Note | undefined> => {
    return await get<Note>(
        'SELECT id, ownerUserId, title, body, createdAt FROM Notes WHERE id = ?;',
        [noteId]
    );
};

export const create = async (data: CreateNoteInput): Promise<Note> => {
    const createdAt = new Date().toISOString();
    const result = await run(
        'INSERT INTO Notes (ownerUserId, title, body, createdAt) VALUES (?, ?, ?, ?);',
        [data.ownerUserId, data.title.trim(), data.body.trim(), createdAt]
    );
    return (await getById(result.lastID))!;
};

export const update = async (noteId: number, ownerUserId: number, data: UpdateNoteInput): Promise<Note | null> => {
    const existing = await getById(noteId);
    if (!existing) return null;
    if (existing.ownerUserId !== ownerUserId) return null;

    const result = await run(
        'UPDATE Notes SET title = ?, body = ? WHERE id = ? AND ownerUserId = ?;',
        [
            (data.title ?? existing.title).trim(),
            (data.body ?? existing.body).trim(),
            noteId,
            ownerUserId
        ]
    );

    if (result.changes === 0) return null;
    return (await getById(noteId))!;
};

export const remove = async (noteId: number, ownerUserId: number): Promise<boolean> => {
    const result = await run(
        'DELETE FROM Notes WHERE id = ? AND ownerUserId = ?;',
        [noteId, ownerUserId]
    );
    return result.changes > 0;
};