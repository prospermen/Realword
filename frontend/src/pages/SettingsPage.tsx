import { useState } from 'react';
import { authApi } from '../api/auth';
import Button from '../components/common/Button';
import FormErrorList from '../components/common/FormErrorList';
import FormNotice from '../components/common/FormNotice';
import Input from '../components/common/Input';
import PageHeader from '../components/common/PageHeader';
import AvatarUpload from '../components/user/AvatarUpload';
import { useFormFeedback } from '../hooks/useFormFeedback';
import { useAuthStore } from '../store/authStore';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();

  const [image, setImage] = useState(user?.image || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { errors, notice, clearFeedback, setErrorMessages, setSuccess, setApiErrors } =
    useFormFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();

    if (password && password !== confirmPassword) {
      setErrorMessages(['New password and confirmation must match']);
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.updateCurrentUser({
        image,
        username,
        bio,
        email,
        ...(password ? { password, currentPassword } : {}),
      });

      setUser(data.user);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setSuccess('Settings updated successfully.');
    } catch (error) {
      setApiErrors(error, 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 620 }}>
      <PageHeader
        title="Settings"
        description="Manage your public profile, avatar, and password in one place."
      />

      <div
        className="app-card"
        style={{ padding: 18, marginBottom: 18, background: 'var(--app-surface-soft)' }}
      >
        <h2 style={{ marginBottom: 6 }}>Account overview</h2>
        <p style={{ margin: 0, color: 'var(--app-muted)' }}>
          Signed in as <strong>{user?.username}</strong> with <strong>{user?.email}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <AvatarUpload
          currentImage={image || null}
          username={username}
          onSuccess={(url) => {
            setImage(url);
            setSuccess('Avatar uploaded. Save settings to persist it to your profile.');
          }}
        />

        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <textarea
          className="app-textarea"
          placeholder="Short bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="app-card" style={{ padding: 16, background: 'var(--app-surface-soft)' }}>
          <h3 style={{ marginBottom: 10 }}>Password</h3>
          <div className="form-stack">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="form-feedback-stack">
          <FormNotice message={notice} title="Success" variant="success" />
          <FormErrorList errors={errors} title="Failed to update settings:" />
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Updating...' : 'Update Settings'}
          </Button>
        </div>
      </form>

      <hr style={{ margin: '24px 0' }} />

      <div className="app-card" style={{ padding: 16, background: 'var(--app-danger-soft)' }}>
        <h3 style={{ marginBottom: 8 }}>Danger Zone</h3>
        <p style={{ margin: '0 0 12px', color: 'var(--app-muted)' }}>
          Log out from this browser session.
        </p>
        <Button type="button" onClick={logout} variant="ghost">
          Logout
        </Button>
      </div>
    </section>
  );
}
