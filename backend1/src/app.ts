import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import logger from './middlewares/logger.middleware';
import errorHandler from './middlewares/error.middleware';
import { all, get, run } from './db/dbClient';

const app = express();

// CORS
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS: origin is not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('/{*path}', cors());

app.use(express.json());
app.use(logger);

// Routes з v1 префіксом
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);

// JOIN endpoint
app.get('/api/v1/posts-with-authors', async (req, res, next) => {
    try {
        const rows = await all(`
            SELECT
                p.id,
                p.title,
                p.content,
                p.createdAt,
                u.id AS authorId,
                u.name AS authorName
            FROM Posts p
            JOIN Users u ON u.id = p.userId
            ORDER BY p.id DESC;
        `);
        return res.json({ data: rows });
    } catch (err) {
        next(err);
    }
});

// Агрегація
app.get('/api/v1/stats/posts-per-user', async (req, res, next) => {
    try {
        const rows = await all(`
            SELECT
                u.id AS userId,
                u.name AS userName,
                COUNT(p.id) AS postCount
            FROM Users u
            LEFT JOIN Posts p ON p.userId = u.id
            GROUP BY u.id
            ORDER BY postCount DESC;
        `);
        return res.json({ data: rows });
    } catch (err) {
        next(err);
    }
});

// LIKE пошук
app.get('/api/v1/search/posts', async (req, res, next) => {
    try {
        const q = (req.query.q as string) || '';
        const sql = `
            SELECT id, title, content, userId, createdAt
            FROM Posts
            WHERE title LIKE '%${q}%'
            ORDER BY id DESC;
        `;
        console.log('[SQL]', sql.trim());
        const rows = await all(sql);
        return res.json({ data: rows });
    } catch (err) {
        next(err);
    }
});

// Мультитаблична операція
app.post('/api/v1/users-with-post', async (req, res, next) => {
    try {
        const { name, email, title, content } = req.body;
        if (!name || !title || !content) {
            return res.status(400).json({
                error: { code: 'VALIDATION_ERROR', message: 'name, title and content are required' }
            });
        }
        const now = new Date().toISOString();
        const safeName = String(name).replace(/'/g, "''");
        const safeEmail = email ? `'${String(email).replace(/'/g, "''")}'` : 'NULL';
        const safeTitle = String(title).replace(/'/g, "''");
        const safeContent = String(content).replace(/'/g, "''");

        const userResult = await run(`
            INSERT INTO Users (name, email, createdAt)
            VALUES ('${safeName}', ${safeEmail}, '${now}');
        `);

        const userId = userResult.lastID;

        const postResult = await run(`
            INSERT INTO Posts (userId, title, content, createdAt)
            VALUES (${userId}, '${safeTitle}', '${safeContent}', '${now}');
        `);

        const user = await get(`SELECT id, name, email, createdAt FROM Users WHERE id = ${userId};`);
        const post = await get(`SELECT id, title, content, userId, createdAt FROM Posts WHERE id = ${postResult.lastID};`);

        return res.status(201).json({ data: { user, post } });
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

export default app;
