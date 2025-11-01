import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import UserMenu from './UserMenu';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  requireAdmin?: boolean; // Jestli stránka vyžaduje admin práva
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, requireAdmin = false }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Pokud není přihlášen, přesměruj na login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Pokud stránka vyžaduje admin práva a uživatel není admin
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/my-animals" replace />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Admin Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pet Management System - {isAdmin ? 'Admin' : 'Můj účet'}
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Veřejná stránka
          </Button>
          
          {/* Odkaz na vlastní zvířata pro všechny přihlášené uživatele */}
          <Button color="inherit" component={Link} to="/my-animals">
            Moje zvířata
          </Button>
          
          {/* Admin-only odkazy */}
          {isAdmin && (
            <>
              <Button color="inherit" component={Link} to="/admin">
                {t('common.admin', 'Admin')}
              </Button>
              <Button color="inherit" component={Link} to="/users">
                {t('navigation.userManagement')}
              </Button>
              <Button color="inherit" component={Link} to="/permissions">
                {t('navigation.permissions')}
              </Button>
              <Button color="inherit" component={Link} to="/groups">
                {t('navigation.groups')}
              </Button>
              <Button color="inherit" component={Link} to="/memberships">
                {t('navigation.memberships')}
              </Button>
              <Button color="inherit" component={Link} to="/oauth-permissions">
                {t('navigation.oauthPermissions')}
              </Button>
              <Button color="inherit" component={Link} to="/oauth-test">
                {t('navigation.oauthTest')}
              </Button>
              <Button color="inherit" component={Link} to="/oauth-debug">
                {t('navigation.oauthDebug')}
              </Button>
              <Button color="inherit" component={Link} to="/animal-species">
                {t('navigation.animalSpecies')}
              </Button>
              <Button color="inherit" component={Link} to="/animals">
                {t('navigation.animals')}
              </Button>
            </>
          )}
          
          <LanguageSwitcher />
          <UserMenu />
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AdminLayout;