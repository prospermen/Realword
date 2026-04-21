import { useEffect, useMemo, useState } from 'react';
import { profileApi } from '../../api/profile';
import type { ArticleSort } from '../../api/article';
import { parseApiErrorMessage } from '../../utils/error';
import type { Article } from '../../types/article';
import type { Profile } from '../../types/profile';

export type ProfileTab = 'authored' | 'favorited' | 'drafts';

const INITIAL_LIMIT = 10;

interface UseProfileOptions {
  username?: string;
  currentUsername?: string;
}

export function useProfile({ username, currentUsername }: UseProfileOptions) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tab, setTab] = useState<ProfileTab>('authored');
  const [sort, setSort] = useState<ArticleSort>('latest');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [articlesError, setArticlesError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [profileRetryKey, setProfileRetryKey] = useState(0);
  const [articleRetryKey, setArticleRetryKey] = useState(0);

  const canFollow = useMemo(
    () => Boolean(currentUsername && profile && currentUsername !== profile.username),
    [currentUsername, profile]
  );
  const isCurrentUserProfile = useMemo(
    () => Boolean(currentUsername && profile && currentUsername === profile.username),
    [currentUsername, profile]
  );
  const availableTabs = useMemo<ProfileTab[]>(
    () => (isCurrentUserProfile ? ['authored', 'drafts', 'favorited'] : ['authored', 'favorited']),
    [isCurrentUserProfile]
  );

  useEffect(() => {
    const targetUsername = username;

    if (!targetUsername) {
      setLoadingProfile(false);
      setProfile(null);
      setProfileError('Profile not found');
      return;
    }

    setTab('authored');

    async function fetchProfile(targetName: string) {
      try {
        setLoadingProfile(true);
        setProfileError('');
        const data = await profileApi.getProfile(targetName);
        setProfile(data.profile);
      } catch (error) {
        setProfile(null);
        setProfileError(parseApiErrorMessage(error, 'Failed to load profile'));
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile(targetUsername);
  }, [profileRetryKey, username]);

  useEffect(() => {
    if (!availableTabs.includes(tab)) {
      setTab('authored');
    }
  }, [availableTabs, tab]);

  useEffect(() => {
    const targetUsername = username;

    if (!targetUsername) {
      setLoadingArticles(false);
      setArticles([]);
      return;
    }

    async function fetchArticles(targetName: string) {
      try {
        setLoadingArticles(true);
        setArticlesError('');
        const params = { limit: INITIAL_LIMIT, offset: 0, sort };
        const data =
          tab === 'favorited'
            ? await profileApi.getFavoritedArticles(targetName, params)
            : await profileApi.getAuthoredArticles(targetName, {
                ...params,
                status: tab === 'drafts' ? 'draft' : 'published',
              });

        setArticles(data.articles);
      } catch (error) {
        setArticles([]);
        setArticlesError(parseApiErrorMessage(error, 'Failed to load articles'));
      } finally {
        setLoadingArticles(false);
      }
    }

    fetchArticles(targetUsername);
  }, [articleRetryKey, sort, tab, username]);

  async function toggleFollow() {
    if (!profile || !canFollow) return;

    try {
      setFollowLoading(true);
      setProfileError('');
      const data = profile.following
        ? await profileApi.unfollowProfile(profile.username)
        : await profileApi.followProfile(profile.username);
      setProfile(data.profile);
    } catch (error) {
      setProfileError(parseApiErrorMessage(error, 'Failed to update follow status'));
    } finally {
      setFollowLoading(false);
    }
  }

  function retryProfile() {
    setProfileRetryKey((value) => value + 1);
  }

  function retryArticles() {
    setArticleRetryKey((value) => value + 1);
  }

  function handleArticleUpdated(updatedArticle: Article) {
    setArticles((prev) => {
      if (tab === 'favorited' && !updatedArticle.favorited) {
        return prev.filter((item) => item.slug !== updatedArticle.slug);
      }

      if (tab === 'drafts' && !updatedArticle.isDraft) {
        return prev.filter((item) => item.slug !== updatedArticle.slug);
      }

      if (tab === 'authored' && updatedArticle.isDraft) {
        return prev.filter((item) => item.slug !== updatedArticle.slug);
      }

      return prev.map((item) => (item.slug === updatedArticle.slug ? updatedArticle : item));
    });
  }

  const emptyText =
    tab === 'authored'
      ? `${profile?.username ?? 'This user'} has not published any articles yet.`
      : tab === 'drafts'
        ? 'No drafts saved yet.'
        : `${profile?.username ?? 'This user'} has not favorited any articles yet.`;

  return {
    profile,
    articles,
    tab,
    setTab,
    sort,
    setSort,
    availableTabs,
    loadingProfile,
    loadingArticles,
    profileError,
    articlesError,
    followLoading,
    canFollow,
    isCurrentUserProfile,
    toggleFollow,
    retryProfile,
    retryArticles,
    handleArticleUpdated,
    emptyText,
  };
}
