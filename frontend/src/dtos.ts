export interface UserDto {
    id: number;
    name: string;
    email: string | null;
    username: string | null;
    role: string | null;
    createdAt: string;
}

export interface CreateUserDto {
    name: string;
    email?: string;
    username?: string;
    role?: string;
}

export interface PostDto {
    id: number;
    title: string;
    content: string;
    category: string | null;
    userId: number;
    createdAt: string;
}

export interface CreatePostDto {
    title: string;
    content: string;
    category?: string;
    userId: number;
}

export interface UpdatePostDto {
    title?: string;
    content?: string;
    category?: string;
}

export interface CommentDto {
    id: number;
    postId: number;
    userId: number;
    text: string;
    createdAt: string;
}

export interface CreateCommentDto {
    postId: number;
    userId: number;
    text: string;
}

export interface UpdateCommentDto {
    text?: string;
}

export interface ApiError {
    status: number;
    message: string;
    details?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
}