import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Container,
  Alert,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4444/api';

const OAuthTest: React.FC = () => {
  const { t } = useTranslation();
  
  const handleDirectOAuth = (provider: 'google' | 'facebook') => {
    console.log(`🚀 Direct OAuth redirect for ${provider}`);
    console.log(`🔗 Redirecting to: ${API_BASE_URL}/auth/${provider}`);
    
    // Direct redirect (no popup) for testing
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

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
            {t('oauth.testTitle')}
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            {t('oauth.testSubtitle')}
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{t('oauth.debugMode')}</strong><br/>
              {t('oauth.debugDescription')}<br/>
              URLs: <code>{API_BASE_URL}/auth/google</code>
            </Typography>
          </Alert>

          <Stack spacing={2}>
            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={() => handleDirectOAuth('google')}
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
              Test Google OAuth (Direct)
            </Button>

            {/* Facebook Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Facebook />}
              onClick={() => handleDirectOAuth('facebook')}
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
              {t('oauth.testFacebookDirect')}
            </Button>

            {/* Debug Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>{t('oauth.debugInfo')}</Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
{`${t('oauth.frontend')}: ${window.location.origin}
${t('oauth.backend')}: ${API_BASE_URL.replace('/api', '')}
${t('oauth.googleUrl')}: ${API_BASE_URL}/auth/google
${t('oauth.facebookUrl')}: ${API_BASE_URL}/auth/facebook`}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default OAuthTest;