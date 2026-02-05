
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Beaker, User, Mail, Lock, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call to POST /api/auth/register/
      await new Promise(r => setTimeout(r, 1500));
      // In a real app, handle response and redirect to login
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="w-full max-w-[440px]">
        <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-blue-100 border border-white relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Beaker size={120} />
          </div>

          <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider mb-8">
            <ChevronLeft size={16} className="mr-1" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Join the CHEM-VIS equipment network</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="py-2 space-y-1.5">
               <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-500">
                  <CheckCircle2 size={10} />
                  <span>8+ Characters</span>
               </div>
               <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-300">
                  <CheckCircle2 size={10} />
                  <span>At least one number</span>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Complete Registration</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
