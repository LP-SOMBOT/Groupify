import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MyGroups from './pages/MyGroups';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AddGroup from './pages/AddGroup';
import EditGroup from './pages/EditGroup';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import CreatorDashboard from './pages/CreatorDashboard';
import Cashout from './pages/Cashout';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
  );
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/adminlp" element={<Admin />} />
            
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Protected Routes */}
              <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
              <Route path="/add-group" element={<ProtectedRoute><AddGroup /></ProtectedRoute>} />
              <Route path="/edit-group/:id" element={<ProtectedRoute><EditGroup /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
              <Route path="/cashout" element={<ProtectedRoute><Cashout /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              
              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}