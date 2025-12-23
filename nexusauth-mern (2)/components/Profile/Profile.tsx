
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { api } from '../../services/apiService';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nameErr = name.trim().length < 2 ? 'Name is too short' : '';
    setErrors(prev => ({ ...prev, name: nameErr }));
  }, [name]);

  const handleSave = async () => {
    if (errors.name) return;
    setSaving(true);
    try {
      const updatedUser = await api.updateProfile(user.id, { name, bio });
      onUpdate(updatedUser);
      alert('Backend database successfully updated.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-900"></div>
        <div className="px-8 pb-8">
          <div className="relative -top-12 flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} 
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-slate-50" 
                alt="Avatar"
              />
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 text-sm">Account UID: {user.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="md:col-span-2 space-y-6">
              <h3 className="font-bold text-slate-800 border-b pb-2">Database Fields</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    errors.name ? 'border-red-300' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">User Biography</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Update your profile description..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <button 
                onClick={handleSave}
                disabled={saving || !!errors.name}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
              >
                {saving ? 'Syncing...' : 'Update Database'}
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h3>
              <div className="space-y-4">
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">REGISTERED EMAIL</span>
                  <span className="text-slate-700 font-mono">{user.email}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">LAST SYNC</span>
                  <span className="text-slate-700 font-mono">{new Date(user.lastLogin).toLocaleString()}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">SECURITY TIER</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold">LVL {Math.floor((user.securityScore || 0) / 10)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
