import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Microsoft as MicrosoftIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const OAuth2TestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleOAuthLogin = (provider: 'google' | 'facebook' | 'microsoft') => {
    const popup = window.open(
      `/auth/${provider}`,
      'oauth-popup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setTestResults(prev => [...prev, `${provider} OAuth flow completed`]);
        // Refresh the page to check authentication status
        setTimeout(() => window.location.reload(), 1000);
      }
    }, 1000);
  };

  const testPermissions = [
    {
      email: 'admin@example.com',
      description: 'Should get admin permissions (full access)',
      expectedRole: 'admin',
      expectedPermissions: '14+ permissions'
    },
    {
      email: 'manager@suchdol.net',
      description: 'Should get manager permissions from domain mapping',
      expectedRole: 'manager',
      expectedPermissions: '8+ permissions'
    },
    {
      email: 'employee@company.com',
      description: 'Should get basic user permissions',
      expectedRole: 'user',
      expectedPermissions: '3+ permissions'
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        OAuth2 Authentication Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Test OAuth2 integration with automatic permission assignment. 
          Login with different providers to see how permissions are automatically assigned based on email domains.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* OAuth Providers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              OAuth2 Providers
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={() => handleOAuthLogin('google')}
                sx={{
                  borderColor: '#db4437',
                  color: '#db4437',
                  '&:hover': {
                    borderColor: '#db4437',
                    backgroundColor: '#db443710'
                  }
                }}
              >
                Login with Google
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<FacebookIcon />}
                onClick={() => handleOAuthLogin('facebook')}
                sx={{
                  borderColor: '#4267B2',
                  color: '#4267B2',
                  '&:hover': {
                    borderColor: '#4267B2',
                    backgroundColor: '#4267B210'
                  }
                }}
              >
                Login with Facebook
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={() => handleOAuthLogin('microsoft')}
                sx={{
                  borderColor: '#00a1f1',
                  color: '#00a1f1',
                  '&:hover': {
                    borderColor: '#00a1f1',
                    backgroundColor: '#00a1f110'
                  }
                }}
              >
                Login with Microsoft
              </Button>
            </Box>

            {testResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Results:
                </Typography>
                <List dense>
                  {testResults.map((result, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={result} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Permission Mapping Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1 }} />
              Permission Assignment Rules
            </Typography>
            
            <List>
              {testPermissions.map((test, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" component="span">
                            {test.email}
                          </Typography>
                          <Chip
                            label={test.expectedRole}
                            size="small"
                            color={
                              test.expectedRole === 'admin' ? 'error' :
                              test.expectedRole === 'manager' ? 'warning' : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {test.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Expected: {test.expectedPermissions}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < testPermissions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* How It Works */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How OAuth2 Permission Assignment Works
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      1. OAuth Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User authenticates with Google, Facebook, or Microsoft using popup flow
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      2. Email Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System checks user's email domain and specific email addresses against mapping rules
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      3. Automatic Assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User is automatically assigned to appropriate groups and receives corresponding permissions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Current Mapping:</strong><br />
                  • talpa@suchdol.net → Admin (14 permissions)<br />
                  • *@suchdol.net → Manager (8 permissions)<br />
                  • Other emails → Basic User (3 permissions)
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OAuth2TestPage;