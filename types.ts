
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  lastLogin: string;
  securityScore?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SecurityAdvice {
  score: number;
  recommendations: string[];
  vulnerabilities: string[];
  summary: string;
}
