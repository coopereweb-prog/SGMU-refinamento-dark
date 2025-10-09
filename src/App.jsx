import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { MapConfigProvider } from './contexts/MapConfigContext';

import { AppLayout } from './components/AppLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import FieldTechnicianPage from './pages/FieldTechnicianPage';
import { ManageOrdersPage } from './pages/ManageOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ManagePointsPage } from './pages/ManagePointsPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageTagsPage } from './pages/ManageTagsPage';
import { ManagePricingPage } from './pages/ManagePricingPage';
import { ManageMapSettingsPage } from './pages/ManageMapSettingsPage';

import { Toaster } from "@/components/ui/sonner";

const ADMIN_ROLES = ['admin', 'operations_manager'];
const TECHNICIAN_ROLES = ['field_technician'];
const CLIENT_ROLES = ['client'];

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <MapConfigProvider>
          <Router>
            <Routes>
              {/* Rotas Públicas e de Tela Cheia */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />

              {/* Rotas de Conteúdo que usam o AppLayout (com header e container) */}
              <Route element={<AppLayout />}>
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientDashboardPage /></ProtectedRoute>} 
                />
                <Route 
                  path="/technician-panel" 
                  element={<ProtectedRoute allowedRoles={TECHNICIAN_ROLES}><FieldTechnicianPage /></ProtectedRoute>} 
                />
                
                {/* Rotas de Administração com Layout aninhado */}
                <Route 
                  path="/admin" 
                  element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout /></ProtectedRoute>}
                >
                  <Route index element={<Navigate to="orders" replace />} />
                  <Route path="orders" element={<ManageOrdersPage />} />
                  <Route path="orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="points" element={<ManagePointsPage />} />
                  <Route path="users" element={<ManageUsersPage />} />
                  <Route path="tags" element={<ManageTagsPage />} />
                  <Route path="pricing" element={<ManagePricingPage />} />
                  <Route path="map-settings" element={<ManageMapSettingsPage />} />
                </Route>
              </Route>

              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </MapConfigProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;