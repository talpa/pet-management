import axios from 'axios';
import { User } from '../types/User';
import { Permission, UserPermission } from '../types/Permission';
import { ApiResponse, PaginatedResponse } from '../types/Api';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for OAuth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Try to get userId from various sources
    const userId = localStorage.getItem('userId') || 
                   sessionStorage.getItem('userId') ||
                   config.headers['x-user-id'] || 
                   '1'; // Default fallback for development
    
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - just clean up tokens
      // Don't redirect here as it interferes with Redux auth flow
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    return apiClient.get<{
      success: boolean;
      data: User[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/users', { params });
  },

  getUserById: (id: number) => {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`);
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<ApiResponse<User>>('/users', userData);
  },

  updateUser: (id: number, userData: Partial<User>) => {
    return apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
  },

  deleteUser: (id: number) => {
    return apiClient.delete<ApiResponse<void>>(`/users/${id}`);
  },
};

// Permission API
export const permissionApi = {
  getPermissions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    return apiClient.get<{
      success: boolean;
      data: Permission[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/permissions', { params });
  },

  getUserPermissions: (userId: number) => {
    return apiClient.get<{
      success: boolean;
      data: UserPermission[];
    }>(`/permissions/user/${userId}`);
  },

  grantPermission: (data: {
    userId: number;
    permissionId: number;
    grantedBy?: number;
    expiresAt?: string;
  }) => {
    return apiClient.post<{
      success: boolean;
      data: UserPermission;
      message: string;
    }>('/permissions/grant', data);
  },

  revokePermission: (userId: number, permissionId: number) => {
    return apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/permissions/user/${userId}/permission/${permissionId}`);
  },

  createPermission: (permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<{
      success: boolean;
      data: Permission;
      message: string;
    }>('/permissions', permissionData);
  },

  getCategories: () => {
    return apiClient.get<{
      success: boolean;
      data: string[];
    }>('/permissions/categories');
  },
};

export const healthApi = {
  checkHealth: () => {
    return apiClient.get<ApiResponse<{ status: string; timestamp: string; uptime: number }>>('/health');
  },
};

export const authApi = {
  login: (email: string, password: string) => {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: {
        user: any;
        token: string;
      };
    }>('/auth/login', {
      email,
      password,
    });
  },

  register: (name: string, email: string, password: string, captchaToken?: string, captchaAnswer?: string, website?: string) => {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: {
        user: any;
        token: string;
      };
    }>('/auth/register', {
      name,
      email,
      password,
      captchaToken,
      captchaAnswer,
      website, // honeypot field
    });
  },

  getCaptcha: () => {
    return apiClient.get<{
      success: boolean;
      data: {
        token: string;
        question: string;
      };
    }>('/auth/captcha');
  },

  verifyToken: () => {
    return apiClient.post<{
      success: boolean;
      data: {
        user: any;
        token: string;
      };
    }>('/auth/verify');
  },

  getCurrentUser: () => {
    return apiClient.get<{
      success: boolean;
      data: any;
    }>('/auth/user');
  },

  logout: () => {
    return apiClient.post<{
      success: boolean;
      message: string;
    }>('/auth/logout');
  },
};

export default apiClient;