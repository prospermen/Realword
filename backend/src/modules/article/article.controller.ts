import { NextFunction, Request, Response } from 'express';
import * as articleService from './article.service';
import { createArticleSchema, updateArticleSchema } from './article.validator';
import { errorBody } from '../utils/response';
import { parsePagination } from '../utils/pagination';

function getParamString(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param ?? '';
}

function getQueryString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function handleArticleError(err: any, res: Response, next: NextFunction) {
  if (err.name === 'ArticleValidationError') {
    return res.status(422).json(errorBody(err.message.split('|')));
  }

  if (err.message === 'Article not found') {
    return res.status(404).json(errorBody(err.message));
  }

  if (err.message === 'Forbidden') {
    return res.status(403).json(errorBody(err.message));
  }

  return next(err);
}

export async function getArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, offset } = parsePagination(req);
    const result = await articleService.getArticles(
      {
        tag: getQueryString(req.query.tag),
        author: getQueryString(req.query.author),
        favorited: getQueryString(req.query.favorited),
        search: getQueryString(req.query.search),
        sort: getQueryString(req.query.sort) as 'latest' | 'oldest' | 'popular' | undefined,
        status: getQueryString(req.query.status) as 'published' | 'draft' | 'all' | undefined,
        limit,
        offset,
      },
      req.user?.userId
    );

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getFeedArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, offset } = parsePagination(req);
    const result = await articleService.getFeedArticles(req.user!.userId, {
      limit,
      offset,
      search: getQueryString(req.query.search),
      sort: getQueryString(req.query.sort) as 'latest' | 'oldest' | 'popular' | undefined,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getArticleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = getParamString(req.params.slug);
    const article = await articleService.getArticleBySlug(slug, req.user?.userId);
    return res.json({ article });
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  const result = createArticleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json(errorBody(result.error.issues.map((issue) => issue.message)));
  }

  try {
    const article = await articleService.createArticle(req.user!.userId, result.data.article);
    return res.status(201).json({ article });
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}

export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  const result = updateArticleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json(errorBody(result.error.issues.map((issue) => issue.message)));
  }

  try {
    const slug = getParamString(req.params.slug);
    const article = await articleService.updateArticle(slug, req.user!.userId, result.data.article);
    return res.json({ article });
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = getParamString(req.params.slug);
    await articleService.deleteArticle(slug, req.user!.userId);
    return res.status(204).send();
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}

export async function favoriteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = getParamString(req.params.slug);
    const article = await articleService.favoriteArticle(slug, req.user!.userId);
    return res.json({ article });
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}

export async function unfavoriteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = getParamString(req.params.slug);
    const article = await articleService.unfavoriteArticle(slug, req.user!.userId);
    return res.json({ article });
  } catch (err: any) {
    return handleArticleError(err, res, next);
  }
}
