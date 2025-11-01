import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Permission, UserPermission } from '../types/Permission';
import { permissionApi } from '../services/api';

export interface PermissionState {
  permissions: Permission[];
  userPermissions: UserPermission[];
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  userPermissions: [],
  categories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'permission/fetchPermissions',
  async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const response = await permissionApi.getPermissions(params);
    return response.data.data;
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'permission/fetchUserPermissions',
  async (userId: number) => {
    const response = await permissionApi.getUserPermissions(userId);
    return response.data.data;
  }
);

export const grantUserPermission = createAsyncThunk(
  'permission/grantPermission',
  async (data: {
    userId: number;
    permissionId: number;
    grantedBy?: number;
    expiresAt?: string;
  }) => {
    const response = await permissionApi.grantPermission(data);
    return response.data.data;
  }
);

export const revokeUserPermission = createAsyncThunk(
  'permission/revokePermission',
  async ({ userId, permissionId }: { userId: number; permissionId: number }) => {
    await permissionApi.revokePermission(userId, permissionId);
    return { userId, permissionId };
  }
);

export const createPermission = createAsyncThunk(
  'permission/createPermission',
  async (permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await permissionApi.createPermission(permissionData);
    return response.data.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'permission/fetchCategories',
  async () => {
    const response = await permissionApi.getCategories();
    return response.data.data;
  }
);

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      })
      
      // Fetch user permissions
      .addCase(fetchUserPermissions.fulfilled, (state, action: PayloadAction<UserPermission[]>) => {
        state.userPermissions = action.payload;
      })
      
      // Grant permission
      .addCase(grantUserPermission.fulfilled, (state, action: PayloadAction<UserPermission>) => {
        const existingIndex = state.userPermissions.findIndex(
          up => up.userId === action.payload.userId && up.permissionId === action.payload.permissionId
        );
        if (existingIndex !== -1) {
          state.userPermissions[existingIndex] = action.payload;
        } else {
          state.userPermissions.push(action.payload);
        }
      })
      
      // Revoke permission
      .addCase(revokeUserPermission.fulfilled, (state, action) => {
        state.userPermissions = state.userPermissions.filter(
          up => !(up.userId === action.payload.userId && up.permissionId === action.payload.permissionId)
        );
      })
      
      // Create permission
      .addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.permissions.push(action.payload);
      })
      
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.categories = action.payload;
      });
  },
});

export const { clearError } = permissionSlice.actions;
export default permissionSlice.reducer;