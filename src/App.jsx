import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { MapConfigProvider } from './contexts/MapConfigContext';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import HomePage from './pages/HomePage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminLayout from './components/admin/AdminLayout';
import ManagePointsPage from './pages/ManagePointsPage';
import ManageTagsPage from './pages/ManageTagsPage';
import ManagePricingPage from './pages/ManagePricingPage';
import ManageMapSettingsPage from './pages/ManageMapSettingsPage';
import ManageUsersPage from './pages/ManageUsersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ManageOrdersPage from './pages/ManageOrdersPage';
import FieldTechnicianPage from './pages/FieldTechnicianPage';
import AppLayout from './components/AppLayout';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <MapConfigProvider>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="update-password" element={<UpdatePasswordPage />} />
                <Route path="dashboard" element={<ProtectedRoute><ClientDashboardPage /></ProtectedRoute>} />
                <Route path="technician-panel" element={<ProtectedRoute allowedRoles={['field_technician']}><FieldTechnicianPage /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute allowedRoles={['admin', 'operations_manager']}><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<ManageOrdersPage />} />
                  <Route path="orders" element={<ManageOrdersPage />} />
                  <Route path="orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="points" element={<ManagePointsPage />} />
                  <Route path="tags" element={<ManageTagsPage />} />
                  <Route path="pricing" element={<ManagePricingPage />} />
                  <Route path="map-settings" element={<ManageMapSettingsPage />} />
                  <Route path="users" element={<ManageUsersPage />} />
                </Route>
              </Route>
            </Routes>
          </MapConfigProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;