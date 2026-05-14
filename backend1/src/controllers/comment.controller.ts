import { Request, Response, NextFunction } from 'express';

import * as service from '../services/comment.service';
import { validateComment } from '../utils/validateComment';
import AppError from '../utils/AppError';

type IdParams = {
    id: string;
};

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
    if (value === 'id' || value === 'postId' || value === 'userId') {
        return value;
    }
    return undefined;
};

export const getAll = (
    req: Request<IdParams, unknown, unknown, Query>,
    res: Response
) => {
    res.setHeader('Cache-Control', 'no-store');

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;

    const result = service.getAll({
        page,
        pageSize,
        postId: req.query.postId ? Number(req.query.postId) : undefined,
        sortBy: normalizeSortBy(toString(req.query.sortBy)),
        order: normalizeOrder(toString(req.query.order))
    });

    return res.json({
        ...result,
        items: result.items
    });
};

export const getById = (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = service.getById(Number(req.params.id));

        if (!data) {
            throw new AppError(404, 'Comment not found');
        }

        return res.json({
            data
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
        const errors = validateComment(req.body, true);

        if (errors.length) {
            return next(new AppError(400, 'Validation error', errors));
        }

        const created = service.create({
            postId: Number(req.body.postId),
            userId: Number(req.body.userId),
            text: req.body.text
        });

        return res.status(201).json({
            data: created
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
        const errors = validateComment(req.body, false);

        if (errors.length) {
            return next(new AppError(400, 'Validation error', errors));
        }

        const updated = service.update(Number(req.params.id), {
            text: req.body.text
        });

        if (!updated) {
            throw new AppError(404, 'Comment not found');
        }

        return res.json({
            data: updated
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
            throw new AppError(404, 'Comment not found');
        }

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};
