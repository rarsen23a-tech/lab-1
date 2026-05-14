import { Request, Response, NextFunction } from 'express';

import * as service from '../services/post.service';
import { validatePost } from '../utils/validatePost';

import PostResponseDto from '../dtos/PostResponseDto';
import CreatePostRequestDto from '../dtos/CreatePostRequestDto';
import UpdatePostRequestDto from '../dtos/UpdatePostRequestDto';

import AppError from '../utils/AppError';

type IdParams = {
    id: string;
};

type Query = Record<string, string | undefined>;

const normalizeOrder = (value?: string): 'asc' | 'desc' | undefined => {
    if (value === 'asc' || value === 'desc') return value;
    return undefined;
};

const normalizeSortBy = (value?: string): 'id' | 'userId' | 'title' | undefined => {
    if (value === 'id' || value === 'userId' || value === 'title') {
        return value;
    }
    return undefined;
};

export const getAll = (
    req: Request<Record<string, never>, unknown, unknown, Query>,
    res: Response
) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;

    const result = service.getAll({
        page,
        pageSize,
        sortBy: normalizeSortBy(req.query.sortBy),
        order: normalizeOrder(req.query.order)
    });

    return res.json({
        ...result,
        items: result.items.map(item => new PostResponseDto(item))
    });
};

export const getById = (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const post = service.getById(Number(req.params.id));

        if (!post) {
            throw new AppError(404, 'Post not found');
        }

        return res.json({
            data: new PostResponseDto(post)
        });
    } catch (err) {
        next(err);
    }
};

export const create = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const errors = validatePost(req.body, true);

        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }

        const dto = new CreatePostRequestDto(req.body);

        const post = service.create({
            title: dto.title,
            content: dto.content,
            userId: Number(dto.userId)
        });

        return res.status(201).json({
            data: new PostResponseDto(post)
        });
    } catch (err) {
        next(err);
    }
};

export const update = (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const errors = validatePost(req.body, false);

        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }

        const dto = new UpdatePostRequestDto(req.body);

        const post = service.update(Number(req.params.id), {
            title: dto.title,
            content: dto.content
        });

        if (!post) {
            throw new AppError(404, 'Post not found');
        }

        return res.json({
            data: new PostResponseDto(post)
        });
    } catch (err) {
        next(err);
    }
};

export const remove = (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const ok = service.remove(Number(req.params.id));

        if (!ok) {
            throw new AppError(404, 'Post not found');
        }

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};
