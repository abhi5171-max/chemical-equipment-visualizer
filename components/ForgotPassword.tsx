
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ChevronLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="w-full max-w-[440px]">
        <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-blue-100 border border-white">
          <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider mb-8">
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Link>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reset Password</h2>
                <p className="text-slate-400 text-sm mt-1">We'll send a recovery link to your email</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>Send Link</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Email Sent!</h3>
              <p className="text-slate-400 text-sm mt-2 mb-8">
                If an account exists for <b>{email}</b>, you'll receive instructions shortly.
              </p>
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Return to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
