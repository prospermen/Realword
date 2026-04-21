import { useEffect, useMemo, useState } from 'react';
import { articleApi } from '../../api/article';
import { profileApi } from '../../api/profile';
import { parseApiErrorMessage } from '../../utils/error';
import type { Article } from '../../types/article';

interface UseArticleDetailOptions {
  slug?: string;
  currentUsername?: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onDeleted: () => void;
}

export function useArticleDetail({
  slug,
  currentUsername,
  isAuthenticated,
  onAuthRequired,
  onDeleted,
}: UseArticleDetailOptions) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState(false);
  const [actionError, setActionError] = useState('');

  const isOwner = useMemo(
    () => Boolean(article && currentUsername && article.author.username === currentUsername),
    [article, currentUsername]
  );

  useEffect(() => {
    const currentSlug = slug;

    if (!currentSlug) {
      setError('Invalid article slug');
      setLoading(false);
      return;
    }

    async function fetchArticle(targetSlug: string) {
      try {
        setLoading(true);
        setError('');
        const data = await articleApi.getArticle(targetSlug);
        setArticle(data.article);
      } catch (error) {
        setError(parseApiErrorMessage(error, 'Failed to load article'));
      } finally {
        setLoading(false);
      }
    }

    fetchArticle(currentSlug);
  }, [slug, retryKey]);

  function retryArticle() {
    setRetryKey((value) => value + 1);
  }

  async function toggleFavorite() {
    if (!article) return;

    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    try {
      setFavoriteLoading(true);
      setActionError('');
      const data = article.favorited
        ? await articleApi.unfavoriteArticle(article.slug)
        : await articleApi.favoriteArticle(article.slug);
      setArticle(data.article);
    } catch (error) {
      setActionError(parseApiErrorMessage(error, 'Failed to update favorite status'));
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function toggleFollow() {
    if (!article || isOwner) return;

    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    try {
      setFollowLoading(true);
      setActionError('');
      const data = article.author.following
        ? await profileApi.unfollowProfile(article.author.username)
        : await profileApi.followProfile(article.author.username);

      setArticle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          author: {
            ...prev.author,
            username: data.profile.username,
            bio: data.profile.bio,
            image: data.profile.image,
            following: data.profile.following,
          },
        };
      });
    } catch (error) {
      setActionError(parseApiErrorMessage(error, 'Failed to update follow status'));
    } finally {
      setFollowLoading(false);
    }
  }

  async function deleteArticle() {
    if (!article || !isOwner) return;
    if (!window.confirm('Delete this article? This action cannot be undone.')) return;

    try {
      setDeletingArticle(true);
      setActionError('');
      await articleApi.deleteArticle(article.slug);
      onDeleted();
    } catch (error) {
      setActionError(parseApiErrorMessage(error, 'Failed to delete article'));
    } finally {
      setDeletingArticle(false);
    }
  }

  return {
    article,
    loading,
    error,
    retryArticle,
    isOwner,
    favoriteLoading,
    followLoading,
    deletingArticle,
    actionError,
    toggleFavorite,
    toggleFollow,
    deleteArticle,
  };
}
