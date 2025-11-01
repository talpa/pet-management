import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Container,
  Alert,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth, clearError } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  // Detect if running in VS Code Simple Browser
  const isSimpleBrowser = navigator.userAgent.includes('VS Code') || 
                          window.location.href.includes('vscode-webview') ||
                          window.parent !== window;

  console.log('Login component initialized:', { isAuthenticated, isSimpleBrowser });

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Check for auth success/error in URL params (fallback for redirect flow)
    const urlParams = new URLSearchParams(location.search);
    const authStatus = urlParams.get('auth');

    if (authStatus === 'success') {
      // Try to get user data after successful OAuth
      console.log('🔍 URL auth=success detected - checking auth');
      dispatch(checkAuth());
    } else if (authStatus === 'error') {
      // Handle OAuth error
      dispatch(clearError());
    }

    // Listen for popup messages
    const handleMessage = (event: MessageEvent) => {
      console.log('=== postMessage received ===');
      console.log('Origin:', event.origin);
      console.log('Expected origin:', window.location.origin);
      console.log('Data:', event.data);
      console.log('Source:', event.source);
      console.log('=============================');

      // Security check - only accept messages from our backend
      const expectedOrigins = [
        'http://localhost:4444',
        window.location.origin,
        'null' // for file:// protocol in some cases
      ];
      
      // Allow messages from expected origins or if event.origin is null (popup)
      if (event.origin && !expectedOrigins.includes(event.origin)) {
        console.warn('⚠️ Ignoring message from unexpected origin:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        console.log('✅ OAuth success message received - dispatching checkAuth');
        console.log('User data from OAuth:', event.data.user);
        dispatch(checkAuth());
        // Navigation will be handled by the useEffect above when isAuthenticated changes
      } else if (event.data && event.data.type === 'OAUTH_ERROR') {
        console.log('❌ OAuth error message received');
        console.log('Error details:', event.data.error);
        dispatch(clearError());
      } else {
        console.log('🔍 Unknown message type or data:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [dispatch, navigate, location.search, isAuthenticated]);

  // Separate useEffect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    console.log(`🚀 Starting OAuth login for ${provider}`);
    console.log(`🔗 OAuth URL: ${API_BASE_URL}/auth/${provider}`);
    
    // Clear any existing errors
    dispatch(clearError());
    
    // Open OAuth in popup window with better configuration
    const popup = window.open(
      `${API_BASE_URL}/auth/${provider}`,
      'oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
    );

    console.log('📱 Popup opened:', popup);
    console.log('📱 Popup closed status:', popup?.closed);

    // Listen for popup completion with timeout
    let checkInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      if (checkInterval) {
        console.log('🧹 Clearing popup check interval');
        clearInterval(checkInterval);
      }
      if (timeoutId) {
        console.log('🧹 Clearing popup timeout');
        clearTimeout(timeoutId);
      }
    };

    if (popup) {
      // Check popup status more frequently
      checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            console.log('📱 Popup closed detected - cleaning up');
            cleanup();
            // Give some time for postMessage to be processed
            setTimeout(() => {
              console.log('🔍 Checking auth status after popup close');
              dispatch(checkAuth());
            }, 1000);
          } else {
            // Try to access popup location to detect navigation
            try {
              if (popup.location.href) {
                console.log('📱 Popup location accessible:', popup.location.href);
              }
            } catch (e) {
              // This is expected due to CORS, but popup is still active
              console.log('📱 Popup still active (CORS expected)');
            }
          }
        } catch (e) {
          console.log('📱 Error checking popup status:', e);
        }
      }, 500); // Check every 500ms instead of 1000ms

      // Auto-close after 5 minutes if still open
      timeoutId = setTimeout(() => {
        console.log('⏰ Popup timeout - force closing');
        if (popup && !popup.closed) {
          popup.close();
        }
        cleanup();
      }, 5 * 60 * 1000);
    } else {
      console.log('🚫 Popup blocked, using redirect fallback');
      // Fallback to redirect if popup is blocked
      window.location.href = `${API_BASE_URL}/auth/${provider}`;
    }
  };

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Přihlášení
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Vyberte způsob přihlášení
          </Typography>

          {isSimpleBrowser && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>VS Code Simple Browser:</strong><br/>
                Pro plné OAuth přihlášení otevřete aplikaci v hlavním prohlížeči:<br/>
                <code>http://localhost:3300</code>
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Debug tlačítko pro testování checkAuth */}
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                console.log('Manual checkAuth test');
                dispatch(checkAuth());
              }}
              disabled={loading}
            >
              Test CheckAuth (Debug)
            </Button>

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={() => handleOAuthLogin('google')}
              disabled={loading || isSimpleBrowser}
              sx={{
                py: 1.5,
                borderColor: '#db4437',
                color: '#db4437',
                '&:hover': {
                  borderColor: '#c23321',
                  backgroundColor: 'rgba(219, 68, 55, 0.04)',
                },
              }}
            >
              Přihlásit se pomocí Google
            </Button>

            {/* Facebook Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Facebook />}
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading || isSimpleBrowser}
              sx={{
                py: 1.5,
                borderColor: '#4267B2',
                color: '#4267B2',
                '&:hover': {
                  borderColor: '#365899',
                  backgroundColor: 'rgba(66, 103, 178, 0.04)',
                },
              }}
            >
              Přihlásit se pomocí Facebook
            </Button>
          </Stack>

            {/* Manual redirect tlačítko */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                console.log('Manual redirect to home');
                navigate('/', { replace: true });
              }}
            >
              Jít na hlavní stránku (Pokud jste přihlášeni)
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                nebo
              </Typography>
            </Divider>          <Typography variant="body2" align="center" color="text.secondary">
            Pokračováním souhlasíte s našimi podmínkami použití
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;