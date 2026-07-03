/**
 * Manager pending approvals: review, approve, or reject (with comments)
 * pending leave requests. Supports type/search filtering.
 */
import { useCallback, useEffect, useState } from 'react';
import { managerApi, LEAVE_TYPES, dayCount } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function PendingApprovals() {
  const [filters, setFilters] = useState({ search: '', leaveType: '', page: 1 });
  const [data, setData] = useState({ rows: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null); // { leave, type: 'approve' | 'reject' }
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: 8 };
      if (filters.search) params.search = filters.search;
      if (filters.leaveType) params.leaveType = filters.leaveType;
      const res = await managerApi.pending(params);
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

  const openAction = (leave, type) => {
    setAction({ leave, type });
    setComments('');
    setFormError('');
  };

  const submit = async () => {
    if (action.type === 'reject' && comments.trim().length < 3) {
      setFormError('Please provide a comment (min 3 characters) when rejecting.');
      return;
    }
    setBusy(true);
    try {
      if (action.type === 'approve') {
        await managerApi.approve(action.leave.id, comments.trim() || undefined);
      } else {
        await managerApi.reject(action.leave.id, comments.trim());
      }
      setAction(null);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending Approvals</h1>

      <div className="card grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Search reason…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          aria-label="Search pending requests"
        />
        <select
          className="input capitalize"
          value={filters.leaveType}
          onChange={(e) => setFilters((f) => ({ ...f, leaveType: e.target.value, page: 1 }))}
          aria-label="Filter by leave type"
        >
          <option value="">All types</option>
          {LEAVE_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : data.rows.length === 0 ? (
        <div className="card text-center text-gray-500 dark:text-gray-400">No pending requests. 🎉</div>
      ) : (
        <div className="space-y-3">
          {data.rows.map((l) => (
            <div key={l.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {l.employee?.name}{' '}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    · {l.employee?.department}
                  </span>
                </p>
                <p className="text-sm capitalize">
                  {l.leaveType} · {l.startDate} → {l.endDate} ({dayCount(l.startDate, l.endDate)}d)
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reason: {l.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={l.status} />
                <button className="btn-success" onClick={() => openAction(l, 'approve')}>Approve</button>
                <button className="btn-danger" onClick={() => openAction(l, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Prev</button>
          <span className="text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button className="btn-secondary" disabled={filters.page >= data.pagination.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
        </div>
      )}

      <Modal
        open={!!action}
        title={action?.type === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        onClose={() => setAction(null)}
      >
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          {action?.leave?.employee?.name} · <span className="capitalize">{action?.leave?.leaveType}</span> leave
        </p>
        <Alert type="error">{formError}</Alert>
        <label className="label mt-3">
          Comments {action?.type === 'reject' ? '(required)' : '(optional)'}
        </label>
        <textarea
          rows={3}
          className="input"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          maxLength={500}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button
            className={action?.type === 'approve' ? 'btn-success' : 'btn-danger'}
            onClick={submit}
            disabled={busy}
          >
            {busy ? 'Saving…' : action?.type === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
