import { Request, Response, NextFunction } from 'express';
import * as service from '../services/user.service';
import { validateUser } from '../utils/validateUser';
import CreateUserRequestDto from '../dtos/CreateUserRequestDto';
import UpdateUserRequestDto from '../dtos/UpdateUserRequestDto';
import UserResponseDto from '../dtos/UserResponseDto';
import AppError from '../utils/AppError';

type IdParams = { id: string };
type Query = Record<string, string | undefined>;
type User = { id: number; name: string; email: string | null; username: string | null; role: string | null; createdAt: string };

const toResponse = (user: User): UserResponseDto => new UserResponseDto(user);

const normalizeOrder = (value?: string): 'asc' | 'desc' | undefined => {
    if (value === 'asc' || value === 'desc') return value;
    return undefined;
};

const normalizeSortBy = (value?: string): 'id' | 'name' | undefined => {
    if (value === 'id' || value === 'name') return value;
    return undefined;
};

export const getAll = async (
    req: Request<IdParams, unknown, unknown, Query>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await service.getAll({
            page,
            pageSize: limit,
            sortBy: normalizeSortBy(req.query.sortBy),
            order: normalizeOrder(req.query.order)
        });
        return res.json({
            ...result,
            items: result.items.map(toResponse)
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
        const user = await service.getById(Number(req.params.id));
        return res.json({ data: toResponse(user) });
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
        const errors = validateUser(req.body);
        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }
        const dto = new CreateUserRequestDto(req.body);
        const user = await service.create({
            name: dto.name,
            email: dto.email,
            username: dto.username,
            role: dto.role
        });
        return res.status(201).json({ data: toResponse(user) });
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
        const errors = validateUser(req.body);
        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }
        const dto = new UpdateUserRequestDto(req.body);
        const user = await service.update(Number(req.params.id), {
            name: dto.name,
            email: dto.email,
            username: dto.username,
            role: dto.role
        });
        return res.json({ data: toResponse(user) });
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
