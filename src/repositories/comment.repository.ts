type Comment = {
    id: number;
    postId: number;
    userId: number;
    text: string;
};

type CreateCommentInput = {
    postId: number;
    userId: number;
    text: string;
};

type UpdateCommentInput = {
    text?: string;
};

const comments: Comment[] = [];
let id = 1;

export const findAll = () => {
    return comments;
};

export const findById = (commentId: number): Comment | undefined => {
    return comments.find(c => c.id === commentId);
};

export const create = (data: CreateCommentInput): Comment => {
    const comment: Comment = {
        id: id++,
        postId: data.postId,
        userId: data.userId,
        text: data.text
    };

    comments.push(comment);
    return comment;
};

export const update = (
    commentId: number,
    data: UpdateCommentInput
): Comment | null => {
    const index = comments.findIndex(c => c.id === commentId);

    if (index === -1) return null;

    comments[index] = {
        ...comments[index],
        text: data.text ?? comments[index].text
    };

    return comments[index];
};

export const remove = (commentId: number): boolean => {
    const index = comments.findIndex(c => c.id === commentId);

    if (index === -1) return false;

    comments.splice(index, 1);
    return true;
};