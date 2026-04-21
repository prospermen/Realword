import { useParams } from 'react-router-dom';
import ArticleList from '../components/article/ArticleList';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';
import Spinner from '../components/common/Spinner';
import ProfileHeader from '../components/user/ProfileHeader';
import { useProfile } from '../features/profile/useProfile';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { username } = useParams();
  const currentUsername = useAuthStore((state) => state.user?.username);

  const {
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
  } = useProfile({ username, currentUsername });

  function getProfileTabButtonStyle(isActive: boolean) {
    return `tab-button ${isActive ? 'active' : ''}`.trim();
  }

  function renderTabLabel(value: (typeof availableTabs)[number]) {
    if (value === 'authored') return 'Published';
    if (value === 'drafts') return 'Drafts';
    return 'Favorited';
  }

  if (loadingProfile) return <Spinner />;

  if (profileError && !profile) {
    return (
      <section>
        <ErrorState message={profileError} onRetry={retryProfile} />
      </section>
    );
  }

  return (
    <section>
      {profile ? (
        <ProfileHeader
          profile={profile}
          showFollowButton={canFollow}
          followLoading={followLoading}
          onToggleFollow={toggleFollow}
          isCurrentUser={isCurrentUserProfile}
          actionsSlot={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                type="button"
                variant={sort === 'latest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSort('latest')}
              >
                Latest
              </Button>
              <Button
                type="button"
                variant={sort === 'popular' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSort('popular')}
              >
                Popular
              </Button>
            </div>
          }
        />
      ) : null}

      {profileError && profile ? (
        <div style={{ marginBottom: 12 }}>
          <ErrorState message={profileError} />
        </div>
      ) : null}

      <div className="tab-strip">
        {availableTabs.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={getProfileTabButtonStyle(tab === value)}
          >
            {renderTabLabel(value)}
          </button>
        ))}
      </div>

      <ArticleList
        articles={articles}
        loading={loadingArticles}
        error={articlesError}
        emptyText={emptyText}
        title={
          tab === 'authored'
            ? 'Published Articles'
            : tab === 'drafts'
              ? 'Draft Articles'
              : 'Favorited Articles'
        }
        description={
          profile
            ? tab === 'authored'
              ? `Showing published articles by @${profile.username}`
              : tab === 'drafts'
                ? 'Your private drafts are listed here.'
                : `Showing favorited articles by @${profile.username}`
            : ''
        }
        showCount
        onRetry={retryArticles}
        onArticleUpdated={handleArticleUpdated}
      />
    </section>
  );
}
