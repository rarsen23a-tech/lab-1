import { Request, Response, NextFunction } from 'express';
import * as service from '../services/post.service';
import { validatePost } from '../utils/validatePost';
import PostResponseDto from '../dtos/PostResponseDto';
import CreatePostRequestDto from '../dtos/CreatePostRequestDto';
import UpdatePostRequestDto from '../dtos/UpdatePostRequestDto';
import AppError from '../utils/AppError';

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

const normalizeOrder = (value?: string): 'asc' | 'desc' | undefined => {
    if (value === 'asc' || value === 'desc') return value;
    return undefined;
};

const normalizeSortBy = (value?: string): 'id' | 'userId' | 'title' | undefined => {
    if (value === 'id' || value === 'userId' || value === 'title') return value;
    return undefined;
};

export const getAll = async (
    req: Request<Record<string, never>, unknown, unknown, Query>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.limit) || 10;
        const result = await service.getAll({
            page,
            pageSize,
            sortBy: normalizeSortBy(req.query.sortBy),
            order: normalizeOrder(req.query.order)
        });
        return res.json({
            ...result,
            items: result.items.map(item => new PostResponseDto(item))
        });
    } catch (err) {
        next(err);
    }
};

export const getById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const post = await service.getById(Number(req.params.id));
        return res.json({ data: new PostResponseDto(post) });
    } catch (err) {
        next(err);
    }
};

export const create = async (
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
        const post = await service.create({
            title: dto.title,
            content: dto.content,
            category: dto.category,
            userId: Number(dto.userId)
        });
        return res.status(201).json({ data: new PostResponseDto(post) });
    } catch (err) {
        next(err);
    }
};

export const update = async (
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
        const post = await service.update(Number(req.params.id), {
            title: dto.title,
            content: dto.content,
            category: dto.category
        });
        return res.json({ data: new PostResponseDto(post) });
    } catch (err) {
        next(err);
    }
};

export const remove = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        await service.remove(Number(req.params.id));
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};
