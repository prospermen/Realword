import client from './client';
import type { ArticleListResponse } from '../types/article';
import type { ProfileResponse } from '../types/profile';
import type { ArticleSort, ArticleStatusFilter } from './article';

interface GetProfileArticlesParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: ArticleSort;
  status?: ArticleStatusFilter;
}

export const profileApi = {
  async getProfile(username: string) {
    const { data } = await client.get<ProfileResponse>(`/profiles/${username}`);
    return data;
  },

  async followProfile(username: string) {
    const { data } = await client.post<ProfileResponse>(`/profiles/${username}/follow`);
    return data;
  },

  async unfollowProfile(username: string) {
    const { data } = await client.delete<ProfileResponse>(`/profiles/${username}/follow`);
    return data;
  },

  async getAuthoredArticles(username: string, params: GetProfileArticlesParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', {
      params: {
        ...params,
        author: username,
      },
    });
    return data;
  },

  async getFavoritedArticles(username: string, params: GetProfileArticlesParams = {}) {
    const { data } = await client.get<ArticleListResponse>('/articles', {
      params: {
        ...params,
        favorited: username,
      },
    });
    return data;
  },
};
