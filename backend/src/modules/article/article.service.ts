import * as repo from './article.repository';
import { ArticleQuery, CreateArticleInput, UpdateArticleInput } from './article.type';

function validatePublishedArticle(data: {
  title?: string;
  description?: string;
  body?: string;
}) {
  const missingFields: string[] = [];

  if (!data.title?.trim()) {
    missingFields.push('Title is required to publish');
  }

  if (!data.description?.trim()) {
    missingFields.push('Description is required to publish');
  }

  if (!data.body?.trim()) {
    missingFields.push('Body is required to publish');
  }

  if (missingFields.length > 0) {
    const error = new Error(missingFields.join('|'));
    error.name = 'ArticleValidationError';
    throw error;
  }
}

function ensureReadable(article: any, currentUserId?: number) {
  if (!article) {
    throw new Error('Article not found');
  }

  if (article.isDraft && article.authorId !== currentUserId) {
    throw new Error('Article not found');
  }
}

export async function getArticles(query: ArticleQuery, currentUserId?: number) {
  return repo.findArticles(query, currentUserId);
}

export async function getFeedArticles(userId: number, query: Pick<ArticleQuery, 'limit' | 'offset' | 'search' | 'sort'>) {
  return repo.findFeedArticles(userId, query);
}

export async function getArticleBySlug(slug: string, currentUserId?: number) {
  const article = await repo.findArticleBySlug(slug, currentUserId);
  ensureReadable(article, currentUserId);
  return repo.formatArticle(article, currentUserId);
}

export async function createArticle(authorId: number, data: CreateArticleInput) {
  if (!data.isDraft) {
    validatePublishedArticle(data);
  }

  const article = await repo.createArticle(authorId, data);
  return repo.formatArticle(article, authorId);
}

export async function updateArticle(slug: string, authorId: number, data: UpdateArticleInput) {
  const existing = await repo.findArticleBySlug(slug);
  if (!existing) {
    throw new Error('Article not found');
  }

  if ((existing as any).authorId !== authorId) {
    throw new Error('Forbidden');
  }

  const nextState = {
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    body: data.body ?? existing.body,
    isDraft: data.isDraft ?? existing.isDraft,
  };

  if (!nextState.isDraft) {
    validatePublishedArticle(nextState);
  }

  const updated = await repo.updateArticle(slug, data);
  return repo.formatArticle(updated, authorId);
}

export async function deleteArticle(slug: string, authorId: number) {
  const existing = await repo.findArticleBySlug(slug);
  if (!existing) {
    throw new Error('Article not found');
  }

  if ((existing as any).authorId !== authorId) {
    throw new Error('Forbidden');
  }

  await repo.deleteArticle(slug);
}

export async function favoriteArticle(slug: string, userId: number) {
  const article = await repo.findArticleBySlug(slug, userId);
  ensureReadable(article, userId);

  if ((article as any).isDraft) {
    throw new Error('Article not found');
  }

  await repo.favoriteArticle(userId, (article as any).id);
  const updated = await repo.findArticleBySlug(slug, userId);
  ensureReadable(updated, userId);
  return repo.formatArticle(updated, userId);
}

export async function unfavoriteArticle(slug: string, userId: number) {
  const article = await repo.findArticleBySlug(slug, userId);
  ensureReadable(article, userId);

  if ((article as any).isDraft) {
    throw new Error('Article not found');
  }

  await repo.unfavoriteArticle(userId, (article as any).id);
  const updated = await repo.findArticleBySlug(slug, userId);
  ensureReadable(updated, userId);
  return repo.formatArticle(updated, userId);
}
