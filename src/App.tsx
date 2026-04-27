import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import IncidentsPage from './pages/Incidents';
import CamerasPage from './pages/Cameras';
import StaffPage from './pages/Staff';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';

function AuthLayout({ children }: { children: React.ReactNode }) {
  // Now uses TopNav for the global application layout alongside Sidebar.
  return (
    <div className="flex flex-col min-h-screen bg-navy-900">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/incidents" element={
            <ProtectedRoute>
              <AuthLayout>
                <IncidentsPage />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/cameras" element={
            <ProtectedRoute>
              <AuthLayout>
                <CamerasPage />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/staff" element={
            <ProtectedRoute>
              <AuthLayout>
                <StaffPage />
              </AuthLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <AuthLayout>
                <SettingsPage />
              </AuthLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
