import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

const UserMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logout());
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🇬';
      case 'facebook':
        return '🇫';
      case 'microsoft':
        return '🇲';
      default:
        return '👤';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        size="large"
        edge="end"
        aria-label="user menu"
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
      >
        {user.avatar ? (
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 32, height: 32 }}
          />
        ) : (
          <Avatar sx={{ width: 32, height: 32 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        )}
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ mt: 1 }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle1" noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getProviderIcon(user.provider || 'local')} {user.provider || 'Local'} • {user.role}
          </Typography>
        </Box>
        
        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profil</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nastavení</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Odhlásit se</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;