/**
 * Manager view: searchable employee directory with a drill-in to each
 * employee's leave history.
 */
import { useCallback, useEffect, useState } from 'react';
import { managerApi } from '../api/leaves';
import { getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function Employees() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await managerApi.employees({ search: search || undefined, limit: 50 });
      setRows(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const openHistory = async (emp) => {
    setSelected(emp);
    setHistory(null);
    try {
      const res = await managerApi.employeeLeaves(emp.id);
      setHistory(res.data.data.leaves);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Employees</h1>

      <input
        className="input max-w-sm"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search employees"
      />

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="card text-center text-gray-500 dark:text-gray-400">No employees found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 pr-4 font-medium">{e.name}</td>
                  <td className="py-3 pr-4">{e.email}</td>
                  <td className="py-3 pr-4">{e.department}</td>
                  <td className="py-3 pr-4 capitalize">{e.role}</td>
                  <td className="py-3 pr-4">
                    <button className="text-brand-600 hover:underline" onClick={() => openHistory(e)}>
                      View history
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} title={`${selected?.name} — Leave History`} onClose={() => setSelected(null)}>
        {!history ? (
          <Spinner label="Loading history…" />
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No leave records.</p>
        ) : (
          <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
            {history.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <span className="text-sm capitalize">
                  {l.leaveType} · {l.startDate} → {l.endDate}
                </span>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
