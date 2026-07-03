/** Leave-related API calls (employee + manager). */
import client from './client';

export const leavesApi = {
  myStats: () => client.get('/leaves/stats/summary'),
  myLeaves: (params) => client.get('/leaves', { params }),
  getOne: (id) => client.get(`/leaves/${id}`),
  create: (payload) => client.post('/leaves', payload),
  update: (id, payload) => client.put(`/leaves/${id}`, payload),
  cancel: (id) => client.delete(`/leaves/${id}`),
};

export const managerApi = {
  stats: () => client.get('/manager/stats/summary'),
  pending: (params) => client.get('/manager/pending-leaves', { params }),
  allLeaves: (params) => client.get('/manager/leaves', { params }),
  approve: (id, managerComments) =>
    client.put(`/manager/leaves/${id}/approve`, { managerComments }),
  reject: (id, managerComments) =>
    client.put(`/manager/leaves/${id}/reject`, { managerComments }),
  employees: (params) => client.get('/employees', { params }),
  employeeLeaves: (id, params) => client.get(`/manager/employees/${id}/leaves`, { params }),
};

export const LEAVE_TYPES = ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity'];
export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

/** Inclusive day count between two ISO dates. */
export const dayCount = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e - s) / 86400000) + 1;
};
