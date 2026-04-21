import type { Profile } from '../../types/profile';
import type { ReactNode } from 'react';
import FollowButton from './FollowButton';

interface ProfileHeaderProps {
  profile: Profile;
  showFollowButton?: boolean;
  followLoading?: boolean;
  onToggleFollow?: () => void | Promise<void>;
  isCurrentUser?: boolean;
  actionsSlot?: ReactNode;
}

export default function ProfileHeader({
  profile,
  showFollowButton = true,
  followLoading = false,
  onToggleFollow,
  isCurrentUser = false,
  actionsSlot,
}: ProfileHeaderProps) {
  const avatarFallback = profile.username.charAt(0).toUpperCase() || '?';

  return (
    <header
      className="app-card"
      style={{
        padding: 18,
        marginBottom: 18,
        background: 'var(--app-surface-soft)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {profile.image ? (
          <img
            src={profile.image}
            alt={profile.username}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(45, 212, 191, 0.30)',
              boxShadow: '0 0 16px rgba(45, 212, 191, 0.15)',
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '2px solid rgba(45, 212, 191, 0.30)',
              display: 'grid',
              placeItems: 'center',
              color: '#2dd4bf',
              fontWeight: 700,
              background: 'rgba(45, 212, 191, 0.08)',
              boxShadow: '0 0 16px rgba(45, 212, 191, 0.15)',
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {avatarFallback}
          </div>
        )}

        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 28, lineHeight: 1.1 }}>{profile.username}</h1>
          <p style={{ margin: '0 0 4px', color: 'var(--app-muted)', fontSize: 13 }}>@{profile.username}</p>
          <p style={{ margin: 0, color: 'var(--app-muted)' }}>{profile.bio || 'No bio yet.'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isCurrentUser ? (
          <span className="status-pill">
            Your profile
          </span>
        ) : null}

        {actionsSlot ?? null}

        {showFollowButton && onToggleFollow ? (
          <FollowButton
            username={profile.username}
            following={profile.following}
            loading={followLoading}
            onToggle={onToggleFollow}
          />
        ) : null}
      </div>
    </header>
  );
}
