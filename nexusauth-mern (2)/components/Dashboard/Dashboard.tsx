import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { api } from '../../services/apiService';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const isUp = await api.checkHealth();
      setServerOnline(isUp.online);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Centered Profile Section */}
      <div className="text-center pt-4">
        <div className="relative inline-block">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128`} 
            className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto" 
            alt="Profile"
          />
          <span className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-slate-50 rounded-full ${serverOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-slate-500 text-sm mt-1">{user.email}</p>
      </div>

      {/* Main Account Overview Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Account Overview</h2>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
              Active Member
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm mr-4">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Activity</p>
                <p className="text-sm text-slate-700 font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm mr-4">
                <i className="fa-solid fa-fingerprint"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authentication UID</p>
                <p className="text-sm text-slate-700 font-mono">{user.id}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link 
              to="/profile" 
              className="flex-1 px-6 py-3 bg-slate-900 text-white text-center font-bold rounded-xl hover:bg-slate-800 transition-all text-sm"
            >
              Update Profile
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* Connectivity Status Toast (Minimal) */}
      {!serverOnline && serverOnline !== null && (
        <div className="flex items-center justify-center p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium animate-pulse">
          <i className="fa-solid fa-circle-nodes mr-2"></i>
          Reconnecting to secure server...
        </div>
      )}

      <footer className="text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Nexus Secure Protocol v1.0.4
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;