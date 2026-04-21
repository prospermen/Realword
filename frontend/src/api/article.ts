import client from './client';
import type { ArticleListResponse, SingleArticleResponse } from '../types/article';

export type ArticleSort = 'latest' | 'oldest' | 'popular';
export type ArticleStatusFilter = 'published' | 'draft' | 'all';

export interface GetArticlesParams {
  limit?: number;
  offset?: number;
  tag?: string;
  author?: string;
  favorited?: string;
  search?: string;
  sort?: ArticleSort;
  status?: ArticleStatusFilter;
}

export interface ArticleListPagingParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: ArticleSort;
}

export interface ArticlePayload {
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
  isDraft?: boolean;
}

export const articleApi = {
  async getArticles(params: GetArticlesParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', { params });
    return data;
  },

  async getFeed(params: ArticleListPagingParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles/feed', { params });
    return data;
  },

  async getArticlesByTag(tag: string, params: ArticleListPagingParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', {
      params: {
        ...params,
        tag,
      },
    });
    return data;
  },

  async getArticlesByAuthor(author: string, params: GetArticlesParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', {
      params: {
        ...params,
        author,
      },
    });
    return data;
  },

  async getArticlesByFavorited(username: string, params: GetArticlesParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', {
      params: {
        ...params,
        favorited: username,
      },
    });
    return data;
  },

  async getArticle(slug: string) {
    const { data } = await client.get<SingleArticleResponse>(`/articles/${slug}`);
    return data;
  },

  async createArticle(payload: ArticlePayload) {
    const { data } = await client.post<SingleArticleResponse>('/articles', {
      article: payload,
    });
    return data;
  },

  async updateArticle(slug: string, payload: ArticlePayload) {
    const { data } = await client.put<SingleArticleResponse>(`/articles/${slug}`, {
      article: payload,
    });
    return data;
  },

  async deleteArticle(slug: string) {
    await client.delete(`/articles/${slug}`);
  },

  async favoriteArticle(slug: string) {
    const { data } = await client.post<SingleArticleResponse>(`/articles/${slug}/favorite`);
    return data;
  },

  async unfavoriteArticle(slug: string) {
    const { data } = await client.delete<SingleArticleResponse>(`/articles/${slug}/favorite`);
    return data;
  },
};
