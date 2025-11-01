import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import dataReducer from './dataSlice';
import permissionReducer from './permissionSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    data: dataReducer,
    permission: permissionReducer,
    notification: notificationReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;