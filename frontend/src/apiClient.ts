import { API_BASE_URL } from './config.js';
import type { ApiError, UserDto, PostDto, CommentDto, CreateUserDto, CreatePostDto, UpdatePostDto, CreateCommentDto, UpdateCommentDto, PaginatedResponse } from './dtos.js';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    let response: Response;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } catch (e: unknown) {
        const err: ApiError = {
            status: 0,
            message: e instanceof Error && e.name === 'AbortError'
                ? 'Запит перевищив таймаут'
                : 'Помилка мережі або CORS',
            details: e instanceof Error ? e.message : String(e)
        };
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }

    if (response.status === 204) {
        return null as unknown as T;
    }

    const rawText = await response.text();

    if (response.ok) {
        if (!rawText) return null as unknown as T;
        try {
            return JSON.parse(rawText) as T;
        } catch {
            return rawText as unknown as T;
        }
    }

    let payload: Record<string, unknown> | null = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    } catch { }

    const errPayload = payload?.error as Record<string, unknown> | undefined;

    const err: ApiError = {
        status: response.status,
        message: String(errPayload?.message ?? payload?.message ?? 'HTTP помилка'),
        details: String(errPayload?.details ?? payload?.detail ?? rawText ?? `HTTP ${response.status}`)
    };
    throw err;
}

// USERS
export async function getUsers(page = 1, limit = 10): Promise<PaginatedResponse<UserDto>> {
    return await request<PaginatedResponse<UserDto>>(`/users?page=${page}&limit=${limit}`);
}

export async function getUserById(id: number): Promise<{ data: UserDto }> {
    return await request<{ data: UserDto }>(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<{ data: UserDto }> {
    return await request<{ data: UserDto }>('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}

export async function deleteUser(id: number): Promise<void> {
    return await request<void>(`/users/${id}`, { method: 'DELETE' });
}

// POSTS
export async function getPosts(page = 1, limit = 10): Promise<PaginatedResponse<PostDto>> {
    return await request<PaginatedResponse<PostDto>>(`/posts?page=${page}&limit=${limit}`);
}

export async function getPostById(id: number): Promise<{ data: PostDto }> {
    return await request<{ data: PostDto }>(`/posts/${id}`);
}

export async function createPost(dto: CreatePostDto): Promise<{ data: PostDto }> {
    return await request<{ data: PostDto }>('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}

export async function updatePost(id: number, dto: UpdatePostDto): Promise<{ data: PostDto }> {
    return await request<{ data: PostDto }>(`/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}

export async function deletePost(id: number): Promise<void> {
    return await request<void>(`/posts/${id}`, { method: 'DELETE' });
}

// COMMENTS
export async function getComments(postId?: number): Promise<PaginatedResponse<CommentDto>> {
    const query = postId ? `?postId=${postId}&limit=100` : '?limit=100';
    return await request<PaginatedResponse<CommentDto>>(`/comments${query}`);
}

export async function createComment(dto: CreateCommentDto): Promise<{ data: CommentDto }> {
    return await request<{ data: CommentDto }>('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}

export async function updateComment(id: number, dto: UpdateCommentDto): Promise<{ data: CommentDto }> {
    return await request<{ data: CommentDto }>(`/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    });
}

export async function deleteComment(id: number): Promise<void> {
    return await request<void>(`/comments/${id}`, { method: 'DELETE' });
}