import { Request, Response, NextFunction } from 'express';
import { get } from '../db/dbClient';

type User = { id: number; name: string };

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            currentUser?: { id: number; name: string };
        }
    }
}

export const demoAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userIdHeader = req.headers['x-demo-userid'];

    if (!userIdHeader) {
        res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'X-Demo-UserId header is required' }
        });
        return;
    }

    const userId = Number(userIdHeader);

    if (!Number.isFinite(userId) || userId <= 0) {
        res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'Invalid X-Demo-UserId' }
        });
        return;
    }

    const user = await get<User>('SELECT id, name FROM Users WHERE id = ?;', [userId]);

    if (!user) {
        res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'User not found' }
        });
        return;
    }

    req.currentUser = user;
    next();
};