import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ChevronLeft } from 'lucide-react';

export default function Auth() {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  React.useEffect(() => {
    if (user) {
      // Redirect to the page they were trying to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (name.length < 2) throw new Error("Name must be at least 2 characters");
        await signup(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-dark">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-secondary/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        <button 
          onClick={() => navigate('/')} 
          className="absolute -top-16 left-0 flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} /> Back to Home
        </button>

        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 rotate-3">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Sign in to manage your groups' : 'Join the community to add groups'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-3 flex items-center gap-2 text-error text-xs">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><User size={18} /></div>
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18} /></div>
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18} /></div>
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600 transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button fullWidth size="lg" type="submit" isLoading={isLoading} className="mt-2 h-12">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}