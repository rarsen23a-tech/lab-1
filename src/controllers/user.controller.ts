import { Request, Response, NextFunction } from 'express';

import * as service from '../services/user.service';
import { validateUser } from '../utils/validateUser';

import CreateUserRequestDto from '../dtos/CreateUserRequestDto';
import UpdateUserRequestDto from '../dtos/UpdateUserRequestDto';
import UserResponseDto from '../dtos/UserResponseDto';

import AppError from '../utils/AppError';

type IdParams = {
    id: string;
};

type Query = Record<string, string | undefined>;

type User = {
    id: number;
    name: string;
};

const toResponse = (user: User): UserResponseDto => {
    return new UserResponseDto(user);
};

export const getAll = (req: Request<IdParams, unknown, unknown, Query>, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    
    const result = service.getAll({ page, pageSize: limit });

    return res.json({
        ...result,
        items: result.items.map(toResponse)
    });
};

export const getById = (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = service.getById(Number(req.params.id));

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return res.json({
            data: toResponse(user)
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
        const errors = validateUser(req.body);

        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }

        const dto = new CreateUserRequestDto(req.body);

        const user = service.create({
            name: dto.name
        });

        return res.status(201).json({
            data: toResponse(user)
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
        const errors = validateUser(req.body);

        if (errors.length) {
            return next(new AppError(400, 'Invalid request body', errors));
        }

        const dto = new UpdateUserRequestDto(req.body);

        const user = service.update(Number(req.params.id), {
            name: dto.name
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return res.json({
            data: toResponse(user)
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
            throw new AppError(404, 'User not found');
        }

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};