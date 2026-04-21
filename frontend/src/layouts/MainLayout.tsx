import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  function getNavLinkClassName(isActive: boolean) {
    return `app-nav-link ${isActive ? 'active' : ''}`.trim();
  }

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-container layout-header-inner">
          <Link to="/" className="app-brand">
            conduit
          </Link>

          <nav className="app-nav">
            <NavLink to="/" className={({ isActive }) => getNavLinkClassName(isActive)}>
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => getNavLinkClassName(isActive)}
                >
                  New Article
                </NavLink>

                <NavLink
                  to="/settings"
                  className={({ isActive }) => getNavLinkClassName(isActive)}
                >
                  Settings
                </NavLink>

                {user ? (
                  <NavLink
                    to={`/profile/${user.username}`}
                    className={({ isActive }) => getNavLinkClassName(isActive)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.username}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--app-line)',
                        }}
                      />
                    ) : null}
                    <span>{user.username}</span>
                  </NavLink>
                ) : null}

                <Button type="button" onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => getNavLinkClassName(isActive)}>
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => getNavLinkClassName(isActive)}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="layout-container main-content">
        <Outlet />
      </main>
    </div>
  );
}
