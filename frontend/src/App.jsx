/**
 * Application routes.
 * Public: /login. Everything else is protected; manager routes require
 * the `manager` role. Unknown paths render the 404 page.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import LeaveDetails from './pages/LeaveDetails';
import ManagerDashboard from './pages/ManagerDashboard';
import PendingApprovals from './pages/PendingApprovals';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Authenticated app shell */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Employee routes */}
        <Route index element={<EmployeeDashboard />} />
        <Route path="apply" element={<ApplyLeave />} />
        <Route path="history" element={<LeaveHistory />} />
        <Route path="leaves/:id" element={<LeaveDetails />} />
        <Route path="leaves/:id/edit" element={<ApplyLeave />} />
        <Route path="profile" element={<Profile />} />

        {/* Manager routes */}
        <Route
          path="manager"
          element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager/pending"
          element={
            <ProtectedRoute role="manager">
              <PendingApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager/employees"
          element={
            <ProtectedRoute role="manager">
              <Employees />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
