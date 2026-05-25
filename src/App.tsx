import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Courses from './pages/dashboard/Courses';
import Referrals from './pages/dashboard/Referrals';
import Earnings from './pages/dashboard/Earnings';
import Withdraw from './pages/dashboard/Withdraw';
import Settings from './pages/dashboard/Settings';
import SubscribeCallback from './pages/dashboard/SubscribeCallback';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Redirect unauthenticated users to login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Redirect already-authenticated users away from login/register
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Landing />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:courseSlug" element={<Navigate to="/dashboard/courses" replace />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="settings" element={<Settings />} />
        <Route path="subscribe/callback" element={<SubscribeCallback />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
