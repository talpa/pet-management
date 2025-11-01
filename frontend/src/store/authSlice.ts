import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, AuthState } from '../types/Auth';
import { authApi } from '../services/api';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false, // Add flag to track if we've tried to authenticate
};

// Check if user is authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Checking authentication...');
      const response = await authApi.verifyToken();
      console.log('✅ Auth check successful:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log('❌ Auth check failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Getting current user...');
      const response = await authApi.getCurrentUser();
      console.log('✅ Get current user successful:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log('❌ Get current user failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const response = await authApi.logout();
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true;
    },
    setAuth: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        console.log('🔄 Auth check pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('✅ Auth check fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log('❌ Auth check rejected:', action.payload);
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Authentication failed';
        state.initialized = true; // Mark as initialized even on failure
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get user';
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Logout failed';
      });
  },
});

export const { clearAuth, setAuth, clearError } = authSlice.actions;
export default authSlice.reducer;