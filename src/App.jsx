import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import PointsManagementPage from './pages/PointsManagementPage.jsx';
import TagsManagementPage from './pages/TagsManagementPage.jsx';
import FieldTechnicianPage from './pages/FieldTechnicianPage.jsx';
import UpdatePasswordPage from './pages/UpdatePasswordPage.jsx';
import ClientDashboardPage from './pages/ClientDashboardPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from '@/components/ui/sonner';
import { NotificationSystem } from './components/NotificationSystem';

function App() {
  return (
    <>
      <NotificationSystem />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operations_manager']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/points"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operations_manager']}>
              <PointsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tags"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operations_manager']}>
              <TagsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Technician Route */}
        <Route
          path="/technician-panel"
          element={
            <ProtectedRoute allowedRoles={['field_technician']}>
              <FieldTechnicianPage />
            </ProtectedRoute>
          }
        />
        
        {/* Client Route */}
        <Route
          path="/my-account"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster richColors />
    </>
  )
}

export default App;