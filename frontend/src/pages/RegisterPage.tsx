import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import Button from '../components/common/Button';
import FormErrorList from '../components/common/FormErrorList';
import Input from '../components/common/Input';
import { useFormFeedback } from '../hooks/useFormFeedback';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { errors, clearErrors, setApiErrors } = useFormFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    try {
      setLoading(true);
      const data = await authApi.register({ username, email, password });
      login(data.user.token!, data.user);
      navigate('/');
    } catch (error) {
      setApiErrors(error, 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel">
      <h1 className="auth-heading">Create account</h1>
      <p className="auth-subtitle">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit} className="form-stack">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          <FormErrorList errors={errors} title="Register failed:" />
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </section>
  );
}
