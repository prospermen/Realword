import Button from '../common/Button';

interface FavoriteButtonProps {
  favorited: boolean;
  favoritesCount: number;
  loading?: boolean;
  disabled?: boolean;
  onToggle: () => void | Promise<void>;
}

export default function FavoriteButton({
  favorited,
  favoritesCount,
  loading = false,
  disabled = false,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      onClick={onToggle}
      disabled={loading || disabled}
      variant={favorited ? 'secondary' : 'primary'}
      size="sm"
    >
      {loading ? 'Updating...' : favorited ? `Unfavorite (${favoritesCount})` : `Favorite (${favoritesCount})`}
    </Button>
  );
}
