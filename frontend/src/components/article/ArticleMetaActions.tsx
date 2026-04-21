import type { Article } from '../../types/article';
import Button from '../common/Button';
import FollowButton from '../user/FollowButton';
import FavoriteButton from './FavoriteButton';

interface ArticleMetaActionsProps {
  article: Article;
  isOwner: boolean;
  favoriteLoading?: boolean;
  followLoading?: boolean;
  deletingArticle?: boolean;
  onToggleFavorite: () => void | Promise<void>;
  onToggleFollow: () => void | Promise<void>;
  onEditArticle: () => void;
  onDeleteArticle: () => void | Promise<void>;
}

export default function ArticleMetaActions({
  article,
  isOwner,
  favoriteLoading = false,
  followLoading = false,
  deletingArticle = false,
  onToggleFavorite,
  onToggleFollow,
  onEditArticle,
  onDeleteArticle,
}: ArticleMetaActionsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <FavoriteButton
        favorited={article.favorited}
        favoritesCount={article.favoritesCount}
        loading={favoriteLoading}
        disabled={deletingArticle || article.isDraft}
        onToggle={onToggleFavorite}
      />

      {!isOwner ? (
        <FollowButton
          username={article.author.username}
          following={article.author.following}
          loading={followLoading}
          disabled={deletingArticle}
          onToggle={onToggleFollow}
        />
      ) : null}

      {isOwner ? (
        <>
          <Button
            type="button"
            onClick={onEditArticle}
            disabled={deletingArticle}
            size="sm"
            variant="secondary"
          >
            Edit Article
          </Button>
          <Button
            type="button"
            onClick={onDeleteArticle}
            disabled={deletingArticle}
            size="sm"
            variant="danger"
          >
            {deletingArticle ? 'Deleting...' : 'Delete Article'}
          </Button>
        </>
      ) : null}
    </div>
  );
}
