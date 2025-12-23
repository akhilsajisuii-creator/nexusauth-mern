import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { api } from '../../services/apiService';

interface RegisterProps {
  onLogin: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<{message: string, detail?: string, code?: string} | null>(null);
  const [health, setHealth] = useState({ online: false, db: 'checking...' });

  useEffect(() => {
    const checkStatus = async () => {
      const status = await api.checkHealth();
      setHealth(status);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email address';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateName = (val: string) => {
    if (!val) return 'Name is required';
    if (val.trim().length < 2) return 'Name is too short';
    return '';
  };

  useEffect(() => {
    if (touched.name) setErrors(prev => ({ ...prev, name: validateName(name) }));
    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  }, [name, email, password, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    if (nErr || eErr || pErr) {
      setErrors({ name: nErr, email: eErr, password: pErr });
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const user = await api.register(name, email, password);
      onLogin(user);
    } catch (err: any) {
      // Check if it's our custom Atlas error
      if (err.message.includes('Atlas')) {
        setFormError({
          message: 'MongoDB Atlas Permission Denied',
          detail: 'Your cluster says "auth required". This means your username/password are correct, but your database user does not have permission to read/write to the database.',
          code: 'ATLAS_AUTH_REQUIRED'
        });
      } else {
        setFormError({ message: err.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 animate-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create MERN Account</h1>
          <p className="text-slate-500 mt-2 text-sm">Join our secure platform</p>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
            <div className="flex items-start">
              <i className="fa-solid fa-circle-exclamation mt-1 mr-2"></i>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider mb-1">Database Error</p>
                <p className="text-sm font-semibold mb-2">{formError.message}</p>
                {formError.detail && <p className="text-[11px] opacity-80 leading-relaxed mb-3">{formError.detail}</p>}
                
                {formError.code === 'ATLAS_AUTH_REQUIRED' && (
                  <div className="bg-white/50 p-3 rounded-lg border border-red-100 text-[10px] space-y-2">
                    <p className="font-bold">FIX STEPS:</p>
                    <ol className="list-decimal ml-3 space-y-1">
                      <li>Log in to <strong>MongoDB Atlas</strong></li>
                      <li>Go to <strong>Database Access</strong> (left sidebar)</li>
                      <li>Edit your user &gt; <strong>Built-in Role</strong></li>
                      <li>Select <strong>"Atlas Admin"</strong> or <strong>"Read and write to any database"</strong></li>
                      <li>Click <strong>Update User</strong> and wait 1 minute.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onBlur={() => setTouched(p => ({...p, name: true}))}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${
                errors.name && touched.name ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onBlur={() => setTouched(p => ({...p, email: true}))}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${
                errors.email && touched.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onBlur={() => setTouched(p => ({...p, password: true}))}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${
                errors.password && touched.password ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'
              }`}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !health.online}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : null}
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase mb-4">
             <div className="flex items-center">
               <span className={`w-2 h-2 rounded-full mr-1.5 ${health.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
               Server: {health.online ? 'Online' : 'Offline'}
             </div>
             <div className="flex items-center">
               <span className={`w-2 h-2 rounded-full mr-1.5 ${health.db === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
               DB: {health.db}
             </div>
          </div>
          
          <p className="text-center text-slate-500 text-sm">
            Already have an account? 
            <Link to="/login" className="ml-1 text-indigo-600 font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;