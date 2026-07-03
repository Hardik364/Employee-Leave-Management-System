/** Read-only detail view of a single leave request. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { leavesApi, dayCount } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

function Row({ label, children }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

export default function LeaveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    leavesApi
      .getOne(id)
      .then((res) => setLeave(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline">
        ← Back
      </button>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold capitalize">{leave.leaveType} Leave</h1>
          <StatusBadge status={leave.status} />
        </div>

        <Row label="From">{leave.startDate}</Row>
        <Row label="To">{leave.endDate}</Row>
        <Row label="Duration">{dayCount(leave.startDate, leave.endDate)} day(s)</Row>
        <Row label="Reason">{leave.reason}</Row>
        {leave.employee && <Row label="Employee">{leave.employee.name}</Row>}
        {leave.managerComments && <Row label="Manager Comments">{leave.managerComments}</Row>}
        <Row label="Submitted">{new Date(leave.createdAt).toLocaleString()}</Row>

        {leave.status === 'pending' && (
          <div className="mt-5 flex gap-3">
            <Link to={`/leaves/${leave.id}/edit`} className="btn-primary">Edit</Link>
          </div>
        )}
      </div>
    </div>
  );
}
