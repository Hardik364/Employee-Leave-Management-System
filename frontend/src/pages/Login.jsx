/**
 * Login page. Validates input client-side, authenticates via AuthContext,
 * and redirects to the role-appropriate dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'manager' ? '/manager' : '/', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const fill = (role) => {
    if (role === 'manager') {
      setEmail('manager@company.com');
    } else {
      setEmail('employee@company.com');
    }
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-brand-600">🌴 LeaveMS</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Employee Leave Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
          <h2 className="text-xl font-semibold">Sign in</h2>

          <Alert type="error">{serverError}</Alert>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Demo:</span>
            <button type="button" className="underline" onClick={() => fill('manager')}>
              Manager
            </button>
            <span>·</span>
            <button type="button" className="underline" onClick={() => fill('employee')}>
              Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
