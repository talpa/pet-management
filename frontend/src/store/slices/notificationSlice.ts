import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface NotificationState {
  snackbar: SnackbarState;
}

const initialState: NotificationState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setSnackbar: (state, action: PayloadAction<Partial<SnackbarState>>) => {
      state.snackbar = { ...state.snackbar, ...action.payload };
    },
    clearSnackbar: (state) => {
      state.snackbar = { ...initialState.snackbar };
    },
  },
});

export const { setSnackbar, clearSnackbar } = notificationSlice.actions;
export default notificationSlice.reducer;