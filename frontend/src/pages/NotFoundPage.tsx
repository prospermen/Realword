import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <section>
      <EmptyState
        title="404 - Page not found."
        description="The page you are looking for does not exist or has moved."
      />
      <p style={{ marginTop: 12 }}>
        <Link to="/">Back Home</Link>
      </p>
    </section>
  );
}
