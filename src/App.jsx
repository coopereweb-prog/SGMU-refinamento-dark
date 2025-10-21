import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { MapConfigProvider } from '@/contexts/MapConfigContext';
import { CartProvider } from '@/contexts/CartContext';
import { GoogleMapsLoaderProvider } from '@/contexts/GoogleMapsLoaderContext';
import { GlobalCart } from '@/components/GlobalCart';

import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GuestRoute } from '@/components/GuestRoute';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import FieldTechnicianPage from '@/pages/FieldTechnicianPage';
import { ManageOrdersPage } from '@/pages/ManageOrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { ManagePointsPage } from '@/pages/ManagePointsPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import { ManageTagsPage } from '@/pages/ManageTagsPage';
import { ManagePricingPage } from '@/pages/ManagePricingPage';
import { ManageMapSettingsPage } from '@/pages/ManageMapSettingsPage';
import { InstallationPipelinePage } from '@/pages/InstallationPipelinePage';
import SignUpPage from '@/pages/SignUpPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import AboutUsPage from '@/pages/AboutUsPage';
import MobiliarioUrbanoPage from '@/pages/MobiliarioUrbanoPage'; // Novo Import
import ComoAdquirirPage from '@/pages/ComoAdquirirPage';
import TrabalheConoscoPage from '@/pages/TrabalheConoscoPage';
import FaleConoscoPage from '@/pages/FaleConoscoPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import OutdoorsPage from '@/pages/OutdoorsPage';
import LedPanelsPage from '@/pages/LedPanelsPage';

import { Toaster } from "@/components/ui/sonner";

const ADMIN_ROLES = ['admin', 'operations_manager'];
const TECHNICIAN_ROLES = ['field_technician'];
const CLIENT_ROLES = ['client'];

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <MapConfigProvider>
          <CartProvider>
            <GoogleMapsLoaderProvider>
              <Router>
                <Routes>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                  <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
                  <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />

                  {/* Rotas com o layout principal (cabeçalho e rodapé) */}
                  <Route element={<AppLayout />}>
                    {/* Páginas de Conteúdo Público */}
                    <Route path="/quem-somos" element={<AboutUsPage />} />
                    <Route path="/mobiliario-urbano" element={<MobiliarioUrbanoPage />} /> {/* Nova Rota */}
                    <Route path="/como-adquirir" element={<ComoAdquirirPage />} />
                    <Route path="/trabalhe-conosco" element={<TrabalheConoscoPage />} />
                    <Route path="/fale-conosco" element={<FaleConoscoPage />} />
                    <Route path="/outdoors" element={<OutdoorsPage />} />
                    <Route path="/led-panels" element={<LedPanelsPage />} />

                    {/* Páginas Protegidas */}
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
                      <Route path="pipeline" element={<InstallationPipelinePage />} />
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
                <GlobalCart />
              </Router>
            </GoogleMapsLoaderProvider>
            <Toaster />
          </CartProvider>
        </MapConfigProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;