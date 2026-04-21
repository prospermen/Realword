import type { Profile } from './user';

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  isDraft: boolean;
  status: 'draft' | 'published';
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface ArticleListResponse {
  articles: Article[];
  articlesCount: number;
}

export interface SingleArticleResponse {
  article: Article;
}
