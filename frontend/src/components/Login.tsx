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
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth, clearError } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  console.log('🚀 App starting - checking auth');

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
    } else {
      // No URL params, just check if we have valid token
      console.log('🔍 Checking authentication...');
      dispatch(checkAuth());
    }
  }, [dispatch, navigate, location.search, isAuthenticated]);

  // Separate useEffect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    console.log(`🚀 Starting OAuth login for ${provider}`);
    
    // Clear any existing errors
    dispatch(clearError());
    
    // Use window.location.assign for reliable same-window navigation
    const oauthUrl = `${API_BASE_URL}/auth/${provider}`;
    console.log(`🔗 OAuth URL: ${oauthUrl}`);
    window.location.assign(oauthUrl);
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
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
            {t('auth.login')}
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            {t('auth.selectLoginMethod')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
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
              {loading ? t('common.loading') : t('auth.loginWithGoogle')}
            </Button>

            {/* Facebook Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Facebook />}
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading}
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
              {loading ? t('common.loading') : t('auth.loginWithFacebook')}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('common.or')}
              </Typography>
            </Divider>

            {/* Manual redirect button for testing */}
            <Button
              fullWidth
              variant="text"
              color="secondary"
              onClick={() => navigate('/', { replace: true })}
              size="small"
            >
              {t('auth.goToHomePage')}
            </Button>
          </Stack>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
            {t('auth.agreeTerms')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;