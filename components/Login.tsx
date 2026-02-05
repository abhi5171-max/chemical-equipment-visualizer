
import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// Fix: Added missing Loader2 to the lucide-react imports
import { Beaker, Lock, User, Eye, EyeOff, ChevronRight, UserCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In production, this calls POST /api/auth/login/
      await new Promise(r => setTimeout(r, 1000)); // Simulate API

      if (username === 'guest' || (username === 'admin' && password === 'admin123')) {
        login(
          { access: 'mock_jwt_access', refresh: 'mock_jwt_refresh' },
          { id: 1, username, is_guest: username === 'guest' },
          rememberMe
        );
        navigate('/dashboard');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login(
      { access: 'guest_token', refresh: 'guest_refresh' },
      { id: 'guest_' + Date.now(), username: 'Guest User', is_guest: true },
      false
    );
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="w-full max-w-[440px]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 text-white shadow-xl rotate-3">
            <Beaker size={36} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">CHEM-VIS</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Hybrid Visualizer System</p>
        </div>

        {/* Card */}
        <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-blue-100 border border-white">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 animate-shake">
                {error}
              </div>
            )}
            
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Recover Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center space-x-2 border border-slate-100"
            >
              <UserCircle size={18} />
              <span>Continue as Guest</span>
            </button>
            <p className="text-xs text-slate-400">
              Don't have an account? {' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Secure Terminal Access V2.4
        </p>
      </div>
    </div>
  );
};

export default Login;
