export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  provider?: 'local' | 'google' | 'facebook' | 'microsoft';
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
  message?: string;
}