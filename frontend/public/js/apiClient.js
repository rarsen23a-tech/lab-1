import { API_BASE_URL } from './config.js';
async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
    }
    catch (e) {
        const err = {
            status: 0,
            message: e instanceof Error && e.name === 'AbortError'
                ? 'Запит перевищив таймаут'
                : 'Помилка мережі або CORS',
            details: e instanceof Error ? e.message : String(e)
        };
        throw err;
    }
    finally {
        clearTimeout(timeoutId);
    }
    if (response.status === 204) {
        return null;
    }
    const rawText = await response.text();
    if (response.ok) {
        if (!rawText)
            return null;
        try {
            return JSON.parse(rawText);
        }
        catch {
            return rawText;
        }
    }
    let payload = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    }
    catch { }
    const errPayload = payload?.error;
    const err = {
        status: response.status,
        message: String(errPayload?.message ?? payload?.message ?? 'HTTP помилка'),
        details: String(errPayload?.details ?? payload?.detail ?? rawText ?? `HTTP ${response.status}`)
    };
    throw err;
}
// USERS
export async function getUsers(page = 1, limit = 10) {
    return await request(`/users?page=${page}&limit=${limit}`);
}
export async function getUserById(id) {
    return await request(`/users/${id}`);
}
export async function createUser(dto) {
    return await request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}
export async function deleteUser(id) {
    return await request(`/users/${id}`, { method: 'DELETE' });
}
// POSTS
export async function getPosts(page = 1, limit = 10) {
    return await request(`/posts?page=${page}&limit=${limit}`);
}
export async function getPostById(id) {
    return await request(`/posts/${id}`);
}
export async function createPost(dto) {
    return await request('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}
export async function updatePost(id, dto) {
    return await request(`/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}
export async function deletePost(id) {
    return await request(`/posts/${id}`, { method: 'DELETE' });
}
// COMMENTS
export async function getComments(postId) {
    const query = postId ? `?postId=${postId}&limit=100` : '?limit=100';
    return await request(`/comments${query}`);
}
export async function createComment(dto) {
    return await request('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}
export async function updateComment(id, dto) {
    return await request(`/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}
export async function deleteComment(id) {
    return await request(`/comments/${id}`, { method: 'DELETE' });
}
