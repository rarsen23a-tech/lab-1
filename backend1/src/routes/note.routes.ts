import express, { Request, Response, NextFunction } from 'express';
import { demoAuth } from '../middlewares/demoAuth.middleware';
import * as repo from '../repositories/note.repository';

const router = express.Router();

// GET /api/v1/notes Ч список нотаток поточного юзера
router.get('/', demoAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notes = await repo.getAll(req.currentUser!.id);
        return res.json({ items: notes, total: notes.length });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/notes/:id Ч отримати нотатку
router.get('/:id', demoAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const note = await repo.getById(Number(req.params.id));
        if (!note) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        if (note.ownerUserId !== req.currentUser!.id) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        return res.json({ data: note });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/notes Ч створити нотатку
router.post('/', demoAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'title and body are required' } });
        }
        const note = await repo.create({
            ownerUserId: req.currentUser!.id,
            title,
            body
        });
        return res.status(201).json({ data: note });
    } catch (err) {
        next(err);
    }
});

// PUT /api/v1/notes/:id Ч оновити нотатку
router.put('/:id', demoAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, body } = req.body;
        const note = await repo.update(Number(req.params.id), req.currentUser!.id, { title, body });
        if (!note) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        return res.json({ data: note });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/notes/:id Ч видалити нотатку
router.delete('/:id', demoAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ok = await repo.remove(Number(req.params.id), req.currentUser!.id);
        if (!ok) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;