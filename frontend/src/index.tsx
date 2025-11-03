import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store } from './store/store';

// Import i18n configuration
import './i18n/index';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // Global CSS overrides for compatibility
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
        },
        '*': {
          WebkitBoxSizing: 'border-box',
          MozBoxSizing: 'border-box',
          boxSizing: 'border-box',
        },
        // Focus visible styles for better accessibility
        '*:focus-visible': {
          outline: '2px solid #1976d2',
          outlineOffset: '2px',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);