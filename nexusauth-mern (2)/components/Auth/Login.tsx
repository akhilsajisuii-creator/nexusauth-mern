
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { api } from '../../services/apiService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  useEffect(() => {
    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  }, [email, password, touched]);

  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setFormError('');

    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">MERN Auth Login</h1>
          <p className="text-slate-500 mt-2">Access your secure dashboard</p>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-3 flex items-center ${errors.email && touched.email ? 'text-red-400' : 'text-slate-400'}`}>
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input 
                type="email" 
                required
                value={email}
                onBlur={() => handleBlur('email')}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mern.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all outline-none ${
                  errors.email && touched.email 
                    ? 'border-red-300 ring-4 ring-red-50' 
                    : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && touched.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-3 flex items-center ${errors.password && touched.password ? 'text-red-400' : 'text-slate-400'}`}>
                <i className="fa-solid fa-lock"></i>
              </span>
              <input 
                type="password" 
                required
                value={password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all outline-none ${
                  errors.password && touched.password 
                    ? 'border-red-300 ring-4 ring-red-50' 
                    : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.password && touched.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading || !isFormValid}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <span>Sign In</span>}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            Need an account? 
            <Link to="/register" className="ml-1 text-indigo-600 font-bold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
