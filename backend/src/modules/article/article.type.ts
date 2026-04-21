export interface ArticleQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'popular';
  status?: 'published' | 'draft' | 'all';
  limit?: number;
  offset?: number;
}

export interface CreateArticleInput {
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
  isDraft?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
  isDraft?: boolean;
}
