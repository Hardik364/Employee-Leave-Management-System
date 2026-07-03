/**
 * Leave history: searchable, filterable, paginated list of the
 * employee's own leave requests with edit/cancel actions.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leavesApi, LEAVE_TYPES, LEAVE_STATUSES } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function LeaveHistory() {
  const [filters, setFilters] = useState({ search: '', status: '', leaveType: '', page: 1 });
  const [data, setData] = useState({ rows: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: 8 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.leaveType) params.leaveType = filters.leaveType;
      const res = await leavesApi.myLeaves(params);
      setData({ rows: res.data.data, pagination: res.data.pagination });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, page: 1 }));

  const confirmCancel = async () => {
    try {
      await leavesApi.cancel(cancelTarget.id);
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setCancelTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave History</h1>
        <Link to="/apply" className="btn-primary">Apply</Link>
      </div>

      <div className="card grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          className="input"
          placeholder="Search reason…"
          value={filters.search}
          onChange={update('search')}
          aria-label="Search leave history"
        />
        <select className="input capitalize" value={filters.status} onChange={update('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {LEAVE_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select className="input capitalize" value={filters.leaveType} onChange={update('leaveType')} aria-label="Filter by type">
          <option value="">All types</option>
          {LEAVE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : data.rows.length === 0 ? (
        <div className="card text-center text-gray-500 dark:text-gray-400">No leave requests found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Dates</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 pr-4 capitalize">{l.leaveType}</td>
                  <td className="py-3 pr-4">{l.startDate} → {l.endDate}</td>
                  <td className="py-3 pr-4"><StatusBadge status={l.status} /></td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <Link to={`/leaves/${l.id}`} className="text-brand-600 hover:underline">View</Link>
                      {l.status === 'pending' && (
                        <>
                          <Link to={`/leaves/${l.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                          <button className="text-red-600 hover:underline" onClick={() => setCancelTarget(l)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn-secondary"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={filters.page >= data.pagination.totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      <Modal open={!!cancelTarget} title="Cancel Leave Request" onClose={() => setCancelTarget(null)}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to cancel this pending {cancelTarget?.leaveType} leave?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setCancelTarget(null)}>Keep</button>
          <button className="btn-danger" onClick={confirmCancel}>Cancel Leave</button>
        </div>
      </Modal>
    </div>
  );
}
