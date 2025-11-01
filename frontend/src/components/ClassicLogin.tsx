import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Container,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Google,
  Facebook,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth, clearError } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ClassicLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form validation
  const [loginErrors, setLoginErrors] = useState<{[key: string]: string}>({});
  const [registerErrors, setRegisterErrors] = useState<{[key: string]: string}>({});

  // Detect if running in VS Code Simple Browser
  const isSimpleBrowser = navigator.userAgent.includes('VS Code') || 
                          window.location.href.includes('vscode-webview') ||
                          window.parent !== window;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Check for auth success/error in URL params
    const urlParams = new URLSearchParams(location.search);
    const authStatus = urlParams.get('auth');

    if (authStatus === 'success') {
      console.log('🔍 URL auth=success detected - checking auth');
      dispatch(checkAuth());
    } else if (authStatus === 'error') {
      dispatch(clearError());
    }

    // Listen for popup messages (OAuth)
    const handleMessage = (event: MessageEvent) => {
      console.log('=== postMessage received ===');
      console.log('Origin:', event.origin);
      console.log('Data:', event.data);

      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        console.log('✅ OAuth success message received');
        dispatch(checkAuth());
      } else if (event.data && event.data.type === 'OAUTH_ERROR') {
        console.log('❌ OAuth error message received');
        dispatch(clearError());
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch, navigate, location.search, isAuthenticated]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormError('');
    setFormSuccess('');
    setLoginErrors({});
    setRegisterErrors({});
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!loginForm.email) {
      errors.email = 'Email je povinný';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Neplatný email formát';
    }

    if (!loginForm.password) {
      errors.password = 'Heslo je povinné';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Heslo musí mít alespoň 6 znaků';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!registerForm.name) {
      errors.name = 'Jméno je povinné';
    } else if (registerForm.name.length < 2) {
      errors.name = 'Jméno musí mít alespoň 2 znaky';
    }

    if (!registerForm.email) {
      errors.email = 'Email je povinný';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Neplatný email formát';
    }

    if (!registerForm.password) {
      errors.password = 'Heslo je povinné';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Heslo musí mít alespoň 6 znaků';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Potvrzení hesla je povinné';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Hesla se neshodují';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    setFormLoading(true);
    setFormError('');

    try {
      const response = await authApi.login(loginForm.email, loginForm.password);

      if (response.data.success) {
        setFormSuccess('Přihlášení úspěšné!');
        dispatch(checkAuth());
        // Navigation handled by useEffect when isAuthenticated changes
      } else {
        setFormError(response.data.message || 'Přihlášení selhalo');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setFormError(
        error.response?.data?.message || 
        'Chyba při přihlašování. Zkontrolujte email a heslo.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;

    setFormLoading(true);
    setFormError('');

    try {
      const response = await authApi.register(
        registerForm.name,
        registerForm.email,
        registerForm.password
      );

      if (response.data.success) {
        setFormSuccess('Registrace úspěšná! Můžete se přihlásit.');
        setTabValue(0); // Switch to login tab
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setFormError(response.data.message || 'Registrace selhala');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setFormError(
        error.response?.data?.message || 
        'Chyba při registraci. Zkuste to znovu.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // OAuth handlers
  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    console.log(`🚀 Starting OAuth login for ${provider}`);
    
    const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
    const popup = window.open(
      `${apiBaseUrl}/auth/${provider}`,
      'oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (popup) {
      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval);
        }
      }, 1000);

      setTimeout(() => {
        popup.close();
        clearInterval(checkInterval);
      }, 5 * 60 * 1000);
    } else {
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      window.location.href = `${apiBaseUrl}/auth/${provider}`;
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Tab Headers */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              },
            }}
          >
            <Tab
              label={t('auth.loginTab')}
              icon={<Lock sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label={t('auth.registerTab')}
              icon={<Person sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
          </Tabs>

          {isSimpleBrowser && (
            <Alert severity="info" sx={{ m: 2 }}>
              <Typography variant="body2">
                <strong>{t('auth.vscodeInfo.title')}</strong><br/>
                {t('auth.vscodeInfo.description')}<br/>
                <code>{t('auth.vscodeInfo.url')}</code>
              </Typography>
            </Alert>
          )}

          {(error || formError) && (
            <Alert 
              severity="error" 
              sx={{ m: 2 }} 
              onClose={() => {
                dispatch(clearError());
                setFormError('');
              }}
            >
              {formError || error}
            </Alert>
          )}

          {formSuccess && (
            <Alert 
              severity="success" 
              sx={{ m: 2 }} 
              onClose={() => setFormSuccess('')}
            >
              {formSuccess}
            </Alert>
          )}

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <Typography variant="h5" align="center" gutterBottom>
                  Vítejte zpět!
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  error={!!loginErrors.email}
                  helperText={loginErrors.email}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Heslo"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  error={!!loginErrors.password}
                  helperText={loginErrors.password}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={formLoading || loading}
                  sx={{ py: 1.5 }}
                >
                  {formLoading ? 'Přihlašování...' : 'Přihlásit se'}
                </Button>
              </Stack>
            </form>
          </TabPanel>

          {/* Register Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleRegister}>
              <Stack spacing={3}>
                <Typography variant="h5" align="center" gutterBottom>
                  Vytvořit účet
                </Typography>

                <TextField
                  fullWidth
                  label="Jméno"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  error={!!registerErrors.name}
                  helperText={registerErrors.name}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  error={!!registerErrors.email}
                  helperText={registerErrors.email}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Heslo"
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  error={!!registerErrors.password}
                  helperText={registerErrors.password}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Potvrzení hesla"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  error={!!registerErrors.confirmPassword}
                  helperText={registerErrors.confirmPassword}
                  disabled={formLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={formLoading || loading}
                  sx={{ py: 1.5 }}
                >
                  {formLoading ? 'Registrace...' : 'Registrovat se'}
                </Button>
              </Stack>
            </form>
          </TabPanel>

          {/* Social Login Section */}
          <Box sx={{ p: 3 }}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                nebo pokračujte s
              </Typography>
            </Divider>

            <Stack spacing={2}>
              {/* Google Login */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Google />}
                onClick={() => handleOAuthLogin('google')}
                disabled={formLoading || loading || isSimpleBrowser}
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
                Google
              </Button>

              {/* Facebook Login */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Facebook />}
                onClick={() => handleOAuthLogin('facebook')}
                disabled={formLoading || loading || isSimpleBrowser}
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
                Facebook
              </Button>
            </Stack>

            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
              Pokračováním souhlasíte s našimi{' '}
              <Link href="#" underline="hover">
                podmínkami použití
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ClassicLogin;