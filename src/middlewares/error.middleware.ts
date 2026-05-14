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
    console.error(err);

    return res.status(err.status ?? 500).json({
        error: {
            message: err.message ?? 'Internal Server Error',
            details: err.details ?? []
        }
    });
};

export default errorMiddleware;