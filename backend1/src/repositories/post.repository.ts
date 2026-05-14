import AppError from '../utils/AppError';

type Post = {
    id: number;
    title: string;
    content: string;
    userId: number;
};

type CreatePostInput = {
    title: string;
    content: string;
    userId: number;
};

type UpdatePostInput = {
    title?: string;
    content?: string;
};

const posts: Post[] = [];
let id = 1;

const toId = (value: string | number): number => Number(value);

export const getAll = (): Post[] => {
    return posts;
};

export const getById = (postId: string | number): Post | undefined => {
    return posts.find(p => p.id === toId(postId));
};

export const create = (data: CreatePostInput): Post => {
    const title = data.title?.trim();
    const content = data.content?.trim();

    if (!title || !content || Number.isNaN(Number(data.userId))) {
        throw new AppError(400, 'Title, content and userId are required');
    }

    const post: Post = {
        id: id++,
        title,
        content,
        userId: Number(data.userId)
    };

    posts.push(post);
    return post;
};

export const update = (
    postId: string | number,
    data: UpdatePostInput
): Post | null => {
    const index = posts.findIndex(p => p.id === toId(postId));

    if (index === -1) return null;

    posts[index] = {
        ...posts[index],
        title: data.title !== undefined
            ? data.title.trim()
            : posts[index].title,
        content: data.content !== undefined
            ? data.content.trim()
            : posts[index].content
    };

    return posts[index];
};

export const remove = (postId: string | number): boolean => {
    const index = posts.findIndex(p => p.id === toId(postId));

    if (index === -1) return false;

    posts.splice(index, 1);
    return true;
};