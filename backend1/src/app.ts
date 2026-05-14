import express from 'express';

import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';

import logger from './middlewares/logger.middleware';
import errorHandler from './middlewares/error.middleware';

const app = express();

app.use(express.json());
app.use(logger);

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use(errorHandler);

export default app;