import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import Button from '../components/common/Button';
import FormErrorList from '../components/common/FormErrorList';
import Input from '../components/common/Input';
import { useFormFeedback } from '../hooks/useFormFeedback';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { errors, clearErrors, setApiErrors } = useFormFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    try {
      setLoading(true);
      const data = await authApi.login({ email, password });
      login(data.user.token!, data.user);
      navigate('/');
    } catch (error) {
      setApiErrors(error, 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel">
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-subtitle">
        No account? <Link to="/register">Create one</Link>
      </p>

      <form onSubmit={handleSubmit} className="form-stack">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="form-feedback-stack">
          <FormErrorList errors={errors} title="Login failed:" />
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
    </section>
  );
}
