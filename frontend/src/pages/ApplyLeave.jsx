/**
 * Apply for leave (also reused to edit a pending leave when :id is present).
 * Includes client-side validation and loading/error states.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leavesApi, LEAVE_TYPES, dayCount } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const empty = { leaveType: 'casual', startDate: '', endDate: '', reason: '' };

export default function ApplyLeave() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    leavesApi
      .getOne(id)
      .then((res) => {
        const l = res.data.data;
        if (l.status !== 'pending') {
          setServerError('Only pending requests can be edited.');
        }
        setForm({
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          reason: l.reason,
        });
      })
      .catch((err) => setServerError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!LEAVE_TYPES.includes(form.leaveType)) next.leaveType = 'Select a leave type';
    if (!form.startDate) next.startDate = 'Start date is required';
    if (!form.endDate) next.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      next.endDate = 'End date cannot be before start date';
    if (!form.reason || form.reason.trim().length < 3)
      next.reason = 'Reason must be at least 3 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await leavesApi.update(id, form);
      } else {
        await leavesApi.create(form);
      }
      navigate('/history', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  const days =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? dayCount(form.startDate, form.endDate)
      : null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">{isEdit ? 'Edit Leave Request' : 'Apply for Leave'}</h1>

      <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
        <Alert type="error">{serverError}</Alert>

        <div>
          <label htmlFor="leaveType" className="label">Leave Type</label>
          <select id="leaveType" className="input capitalize" value={form.leaveType} onChange={set('leaveType')}>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="label">Start Date</label>
            <input id="startDate" type="date" className="input" value={form.startDate} onChange={set('startDate')} />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className="label">End Date</label>
            <input id="endDate" type="date" className="input" value={form.endDate} onChange={set('endDate')} />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {days && <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {days} day(s)</p>}

        <div>
          <label htmlFor="reason" className="label">Reason</label>
          <textarea id="reason" rows={4} className="input" value={form.reason} onChange={set('reason')} maxLength={500} />
          {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Update Request' : 'Submit Request'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
