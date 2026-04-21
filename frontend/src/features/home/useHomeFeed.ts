import { useEffect, useMemo, useState } from 'react';
import { articleApi, type ArticleSort } from '../../api/article';
import { tagApi } from '../../api/tag';
import { usePagination } from '../../hooks/usePagination';
import type { Article } from '../../types/article';

export type FeedTab = 'global' | 'your';

const PAGE_SIZE = 10;

export function useHomeFeed(isAuthenticated: boolean) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedTab, setFeedTab] = useState<FeedTab>('global');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [articleRetryKey, setArticleRetryKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sort, setSort] = useState<ArticleSort>('latest');

  const [tags, setTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagsError, setTagsError] = useState('');

  const { currentPage, setCurrentPage, resetPage } = usePagination(1);
  const totalPages = Math.max(1, Math.ceil(articlesCount / PAGE_SIZE));

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoadingTags(true);
        setTagsError('');
        const data = await tagApi.getTags();
        setTags(data.tags);
      } catch {
        setTags([]);
        setTagsError('Failed to load tags');
      } finally {
        setLoadingTags(false);
      }
    }

    fetchTags();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && feedTab === 'your') {
      setFeedTab('global');
    }
  }, [feedTab, isAuthenticated]);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError('');

        const paging = {
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          search: appliedSearch || undefined,
          sort,
        };

        const data = selectedTag
          ? await articleApi.getArticlesByTag(selectedTag, paging)
          : feedTab === 'your' && isAuthenticated
            ? await articleApi.getFeed(paging)
            : await articleApi.getArticles(paging);

        setArticles(data.articles);
        setArticlesCount(data.articlesCount);
      } catch {
        setArticles([]);
        setArticlesCount(0);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [appliedSearch, articleRetryKey, currentPage, feedTab, isAuthenticated, selectedTag, sort]);

  function handleChangeFeedTab(nextTab: FeedTab) {
    setFeedTab(nextTab);
    setSelectedTag(null);
    resetPage();
  }

  function handleSelectTag(tag: string | null) {
    setSelectedTag(tag);
    setFeedTab('global');
    resetPage();
  }

  function clearTagFilter() {
    setSelectedTag(null);
    resetPage();
  }

  function retryArticles() {
    setArticleRetryKey((value) => value + 1);
  }

  function handleArticleUpdated(updatedArticle: Article) {
    setArticles((prev) =>
      prev.map((item) => (item.slug === updatedArticle.slug ? updatedArticle : item))
    );
  }

  function submitSearch() {
    setAppliedSearch(searchInput.trim());
    resetPage();
  }

  function clearSearch() {
    setSearchInput('');
    setAppliedSearch('');
    resetPage();
  }

  function changeSort(nextSort: ArticleSort) {
    setSort(nextSort);
    resetPage();
  }

  const emptyText = selectedTag
    ? `No articles found for #${selectedTag}.`
    : appliedSearch
      ? `No articles matched "${appliedSearch}".`
      : feedTab === 'your'
        ? 'No articles in your feed yet.'
        : 'No articles yet.';

  const listTitle = selectedTag
    ? `#${selectedTag}`
    : feedTab === 'your'
      ? 'Your Feed'
      : sort === 'popular'
        ? 'Popular Articles'
        : sort === 'oldest'
          ? 'Archive'
          : 'Global Feed';

  const listDescription = useMemo(() => {
    const searchSuffix = appliedSearch ? ` Matching "${appliedSearch}".` : '';

    if (selectedTag) {
      return `Articles tagged with "${selectedTag}".${searchSuffix}`.trim();
    }

    if (feedTab === 'your') {
      return `Latest articles from authors you follow.${searchSuffix}`.trim();
    }

    if (sort === 'popular') {
      return `Discover the most favorited stories from the community.${searchSuffix}`.trim();
    }

    if (sort === 'oldest') {
      return `Browse older posts from the archive.${searchSuffix}`.trim();
    }

    return `Latest articles from the global community.${searchSuffix}`.trim();
  }, [appliedSearch, feedTab, selectedTag, sort]);

  return {
    articles,
    loading,
    error,
    emptyText,
    listTitle,
    listDescription,
    retryArticles,
    handleArticleUpdated,
    tags,
    loadingTags,
    tagsError,
    selectedTag,
    feedTab,
    handleChangeFeedTab,
    handleSelectTag,
    clearTagFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    clearSearch,
    sort,
    changeSort,
  };
}
