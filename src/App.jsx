import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import { MapConfigProvider } from './contexts/MapConfigContext';
import { Toaster } from "@/components/ui/sonner"


function App() {
  return (
    <MapConfigProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
      <Toaster />
    </MapConfigProvider>
  );
}

export default App;