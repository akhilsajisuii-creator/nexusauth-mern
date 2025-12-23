import { User, SecurityAdvice } from "../types";

const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  checkHealth: async (): Promise<{online: boolean, db: string}> => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return { online: false, db: 'unknown' };
      const data = await res.json();
      return { online: true, db: data.db };
    } catch {
      return { online: false, db: 'offline' };
    }
  },

  register: async (name: string, email: string, pass: string): Promise<User> => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      // Create an error that includes the server's specific reason if available
      const errMsg = data.error ? `${data.message}: ${data.error}` : (data.message || 'Registration failed');
      throw new Error(errMsg);
    }
    if (data.token) localStorage.setItem('nexus_token', data.token);
    return data.user;
  },

  login: async (email: string, pass: string): Promise<User> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error ? `${data.message}: ${data.error}` : (data.message || 'Login failed');
      throw new Error(errMsg);
    }
    if (data.token) localStorage.setItem('nexus_token', data.token);
    return data.user;
  },

  updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ id, ...updates })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');
    return data;
  },

  getSecurityReport: async (user: User): Promise<SecurityAdvice> => {
    const res = await fetch(`${BASE_URL}/user/security/${user.email}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Audit failed');
    return data;
  }
};