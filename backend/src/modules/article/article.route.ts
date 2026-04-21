import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middlewares';
import {
  getArticles, getFeedArticles, getArticleBySlug,
  createArticle, updateArticle, deleteArticle,
  favoriteArticle, unfavoriteArticle,
} from './article.controller';

const router = Router();

router.get('/', optionalAuthenticate, getArticles);
router.get('/feed', authenticate, getFeedArticles);
router.get('/:slug', optionalAuthenticate, getArticleBySlug);
router.post('/', authenticate, createArticle);
router.put('/:slug', authenticate, updateArticle);
router.delete('/:slug', authenticate, deleteArticle);
router.post('/:slug/favorite', authenticate, favoriteArticle);
router.delete('/:slug/favorite', authenticate, unfavoriteArticle);

export default router;
