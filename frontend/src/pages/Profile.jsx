/** Employee profile: shows the authenticated user's account details. */
import { useAuth } from '../context/AuthContext';

function Row({ label, children }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="card">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600 dark:bg-brand-600/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
        </div>
        <Row label="Email">{user.email}</Row>
        <Row label="Department">{user.department}</Row>
        <Row label="Role">{user.role}</Row>
        <Row label="Member since">{new Date(user.createdAt).toLocaleDateString()}</Row>
      </div>
    </div>
  );
}
