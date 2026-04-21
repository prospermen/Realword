import { RouterProvider } from 'react-router-dom';
import router from './router';

export default function App() {
  return (
    <div className="app-shell">
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <div className="orb orb-4" aria-hidden="true" />
      <div className="app-frame">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}
