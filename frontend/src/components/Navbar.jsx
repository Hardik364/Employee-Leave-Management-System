/** Top navigation bar with role-aware links, theme toggle, and logout. */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const isManager = user.role === 'manager';
  const links = isManager
    ? [
        { to: '/manager', label: 'Dashboard' },
        { to: '/manager/pending', label: 'Pending Approvals' },
        { to: '/manager/employees', label: 'Employees' },
      ]
    : [
        { to: '/', label: 'Dashboard' },
        { to: '/apply', label: 'Apply Leave' },
        { to: '/history', label: 'Leave History' },
      ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-brand-600">🌴 LeaveMS</span>
          <div className="flex flex-wrap gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="btn-secondary !px-2 !py-1"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <NavLink to="/profile" className="text-sm text-gray-600 hover:underline dark:text-gray-300">
            {user.name}
          </NavLink>
          <button onClick={handleLogout} className="btn-secondary !py-1">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
