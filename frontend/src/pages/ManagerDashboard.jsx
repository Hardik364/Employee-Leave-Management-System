/** Manager dashboard: team totals + recent activity. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { managerApi } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    managerApi
      .stats()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Alert type="error">{error}</Alert>;

  const t = stats.totals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hi {user.name.split(' ')[0]}, here’s the team overview</p>
        </div>
        <Link to="/manager/pending" className="btn-primary">Review Pending ({t.pending})</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Employees" value={t.totalEmployees} accent="brand" />
        <StatCard label="Pending" value={t.pending} accent="yellow" />
        <StatCard label="Approved" value={t.approved} accent="green" />
        <StatCard label="Rejected" value={t.rejected} accent="red" />
        <StatCard label="Cancelled" value={t.cancelled} accent="gray" />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.recent.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {l.employee?.name} · <span className="capitalize">{l.leaveType}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{l.startDate} → {l.endDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={l.status} />
                  <Link to={`/leaves/${l.id}`} className="text-sm text-brand-600 hover:underline">View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
