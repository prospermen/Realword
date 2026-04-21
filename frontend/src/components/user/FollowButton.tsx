import Button from '../common/Button';

interface FollowButtonProps {
  username: string;
  following: boolean;
  loading?: boolean;
  disabled?: boolean;
  onToggle: () => void | Promise<void>;
}

export default function FollowButton({
  username,
  following,
  loading = false,
  disabled = false,
  onToggle,
}: FollowButtonProps) {
  return (
    <Button
      type="button"
      onClick={onToggle}
      disabled={loading || disabled}
      variant={following ? 'secondary' : 'primary'}
      size="sm"
    >
      {loading ? 'Updating...' : following ? `Unfollow ${username}` : `Follow ${username}`}
    </Button>
  );
}
