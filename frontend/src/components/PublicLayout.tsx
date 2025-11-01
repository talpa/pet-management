import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Home as HomeIcon, Pets as PetsIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LanguageSwitcher from './LanguageSwitcher';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, title }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Public Header */}
      <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
        <Toolbar>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pet Management System
          </Typography>
          <LanguageSwitcher />
          {isAuthenticated && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/admin"
              startIcon={<AdminIcon />}
              sx={{ ml: 2 }}
            >
              Admin
            </Button>
          )}
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
            sx={{ ml: 2 }}
          >
            Domů
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Title */}
      {title && (
        <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', py: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" color="primary">
              {title}
            </Typography>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: '#2e7d32', 
          color: 'white', 
          py: 3, 
          mt: 'auto',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2025 Pet Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;