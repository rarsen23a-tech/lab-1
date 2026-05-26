import { Request, Response, NextFunction } from 'express';
import * as service from '../services/comment.service';
import { validateComment } from '../utils/validateComment';
import AppError from '../utils/AppError';
import CommentResponseDto from '../dtos/CommentResponseDto';

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

const toString = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value;
    return undefined;
};

const normalizeOrder = (value?: string): 'asc' | 'desc' | undefined => {
    if (value === 'asc' || value === 'desc') return value;
    return undefined;
};

const normalizeSortBy = (value?: string): 'id' | 'postId' | 'userId' | undefined => {
    if (value === 'id' || value === 'postId' || value === 'userId') return value;
    return undefined;
};

export const getAll = async (
    req: Request<IdParams, unknown, unknown, Query>,
    res: Response,
    next: NextFunction
) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.limit) || 10;
        const result = await service.getAll({
            page,
            pageSize,
            postId: req.query.postId ? Number(req.query.postId) : undefined,
            sortBy: normalizeSortBy(toString(req.query.sortBy)),
            order: normalizeOrder(toString(req.query.order))
        });
        return res.json({
            ...result,
            items: result.items.map(item => new CommentResponseDto(item))
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
        const data = await service.getById(Number(req.params.id));
        return res.json({ data: new CommentResponseDto(data) });
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
        const errors = validateComment(req.body, true);
        if (errors.length) {
            return next(new AppError(400, 'Validation error', errors));
        }
        const created = await service.create({
            postId: Number(req.body.postId),
            userId: Number(req.body.userId),
            text: req.body.text
        });
        return res.status(201).json({ data: new CommentResponseDto(created) });
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
        const errors = validateComment(req.body, false);
        if (errors.length) {
            return next(new AppError(400, 'Validation error', errors));
        }
        const updated = await service.update(Number(req.params.id), {
            text: req.body.text
        });
        return res.json({ data: new CommentResponseDto(updated) });
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
