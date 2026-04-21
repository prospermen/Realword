import express from 'express';
import cors from 'cors';
import articleRoutes from './modules/article/article.route';
import commentRoutes from './modules/comment/comment.route';
import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/user/user.route';
import uploadRoutes from './modules/user/upload.route';
import profileRoutes from './modules/profile/profile.route';
import tagRoutes from './modules/tags/tag.route';
import { requestContextMiddleware } from './modules/middlewares/requestContext.middleware';
import { createRateLimitMiddleware } from './modules/middlewares/rateLimit.middleware';
import { errorMiddleware } from './modules/middlewares/errormiddlewares';
import { notFoundMiddleware } from './modules/middlewares/notFound.middlewares';
import { prisma } from './config/db';
import { env } from './config/env';

const app = express();
const authRateLimit = createRateLimitMiddleware(10);
const uploadRateLimit = createRateLimitMiddleware(5);
const corsOrigin = env.CORS_ORIGINS;

app.set('trust proxy', env.TRUST_PROXY);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigin === '*' || corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  })
);
app.use(requestContextMiddleware);
app.use(express.json());
app.use('/uploads', express.static(env.UPLOADS_DIR));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'degraded' });
  }
});

app.use('/api/users', authRateLimit, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', uploadRateLimit, uploadRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/articles', commentRoutes);
app.use('/api/tags', tagRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
