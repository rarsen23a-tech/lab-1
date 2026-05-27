import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

type AppError = Error & {
    status?: number;
    details?: unknown[];
};

const errorMiddleware: ErrorRequestHandler = (
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const msg = String(err?.message ?? '');

    if (msg.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
            error: {
                code: 'CONFLICT',
                message: 'Value already exists',
                details: [msg]
            }
        });
    }

    if (msg.includes('FOREIGN KEY constraint failed')) {
        return res.status(409).json({
            error: {
                code: 'CONFLICT',
                message: 'Cannot delete — record has related data',
                details: [msg]
            }
        });
    }

    if (msg.includes('NOT NULL constraint failed') || msg.includes('CHECK constraint failed')) {
        return res.status(400).json({
            error: {
                code: 'INVALID_DATA',
                message: 'Invalid data',
                details: [msg]
            }
        });
    }

    const status = err.status ?? 500;
    const code = status === 400 ? 'VALIDATION_ERROR'
        : status === 404 ? 'NOT_FOUND'
            : status === 409 ? 'CONFLICT'
                : 'INTERNAL_ERROR';

    console.error(err);
    return res.status(status).json({
        error: {
            code,
            message: err.message ?? 'Internal Server Error',
            details: err.details ?? []
        }
    });
};

export default errorMiddleware;
