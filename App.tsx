import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MyGroups from './pages/MyGroups';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AddGroup from './pages/AddGroup';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import { AuthProvider, useAuth } from './context/AuthContext';

// Updates to handle redirect back to original location
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
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}