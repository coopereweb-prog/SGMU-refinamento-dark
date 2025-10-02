import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/AppLayout';
import HomePage from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
import { ManagePointsPage } from '@/pages/ManagePointsPage';
import { ManageTagsPage } from '@/pages/ManageTagsPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import LoginPage from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { ClientDashboardPage } from '@/pages/ClientDashboardPage';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rotas Protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ClientDashboardPage />
                </ProtectedRoute>
              } />

              {/* Rotas de Admin */}
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/admin/points" element={<AdminRoute><ManagePointsPage /></AdminRoute>} />
              <Route path="/admin/tags" element={<AdminRoute><ManageTagsPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
            </Route>
          </Routes>
        </Router>
        <ShadcnToaster />
        <SonnerToaster />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;