import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Home as HomeIcon, Pets as PetsIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, title }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Public Header */}
      <AppBar 
        position="static" 
        sx={{ bgcolor: '#2e7d32' }}
        component="nav" 
        id="navigation"
        role="navigation"
        aria-label="Hlavní navigace"
      >
        <Toolbar>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('home.title')}
          </Typography>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
            sx={{ ml: 2 }}
          >
            {t('common.home')}
          </Button>
          
          {user && (
            <Button
              color="inherit"
              component={Link} 
              to="/admin"
              startIcon={<AdminIcon />}
              sx={{ ml: 2 }}
            >
              {t('common.admin')}
            </Button>
          )}
          
          {!user && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              sx={{ ml: 2 }}
            >
              {t('common.login')}
            </Button>
          )}
          
          <LanguageSwitcher />
          
          {user && <UserMenu />}
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
      <Container 
        component="main"
        id="main-content" 
        maxWidth="lg" 
        sx={{ py: 4 }}
        role="main"
        aria-label={title ? `${title} - hlavní obsah` : 'Hlavní obsah'}
      >
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
            {t('home.footer')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;