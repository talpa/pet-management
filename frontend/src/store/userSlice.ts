import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/User';
import { PaginatedResponse } from '../types/Api';
import { userApi } from '../services/api';

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async () => {
    console.log('fetchUsers thunk - calling API...');
    const response = await userApi.getUsers();
    console.log('fetchUsers API response:', response.data);
    return response.data.data; // ApiResponse -> data je pole User[]
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await userApi.createUser(userData);
    return response.data.data;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: number; userData: Partial<User> }) => {
    console.log('=== userSlice updateUser thunk ===');
    console.log('id:', id);
    console.log('userData:', userData);
    
    const response = await userApi.updateUser(id, userData);
    console.log('API response:', response.data);
    
    return response.data.data;
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: number) => {
    await userApi.deleteUser(id);
    return id;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload; // payload je už přímo User[]
        // Poznámka: pagination info se zatím neukládá, můžeme přidat později
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        if (!state.users) {
          state.users = [];
        }
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        if (!state.users) {
          state.users = [];
        }
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        if (!state.users) {
          state.users = [];
        }
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export default userSlice.reducer;