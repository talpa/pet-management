import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { setSnackbar } from '../store/slices/notificationSlice';
import apiClient from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  provider?: 'local' | 'google' | 'facebook' | 'microsoft';
  avatar?: string;
}

interface EffectivePermissions {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  directPermissions: number;
  groupPermissions: number;
  totalEffectivePermissions: number;
  effectivePermissions: any[];
}

const OAuth2PermissionManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<EffectivePermissions | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users?limit=100');
      
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        dispatch(setSnackbar({
          open: true,
          message: 'Failed to fetch users',
          severity: 'error'
        }));
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      dispatch(setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching users',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's effective permissions
  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await apiClient.get(`/user-groups/users/${userId}/effective-permissions-enhanced`);
      
      if (response.data.success) {
        setUserPermissions(response.data.data);
      } else {
        dispatch(setSnackbar({
          open: true,
          message: 'Failed to fetch user permissions',
          severity: 'error'
        }));
      }
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      dispatch(setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching user permissions',
        severity: 'error'
      }));
    }
  };

  // Resync user permissions
  const resyncUserPermissions = async (userId: number) => {
    try {
      setSyncing(userId);
      const response = await apiClient.post(`/user-groups/users/${userId}/resync-permissions`);
      
      if (response.data.success) {
        dispatch(setSnackbar({
          open: true,
          message: 'User permissions resynced successfully',
          severity: 'success'
        }));
        
        // Refresh user data if this user's permissions are currently displayed
        if (selectedUser && selectedUser.id === userId) {
          await fetchUserPermissions(userId);
        }
      } else {
        dispatch(setSnackbar({
          open: true,
          message: response.data.message || 'Failed to resync permissions',
          severity: 'error'
        }));
      }
    } catch (error: any) {
      console.error('Error resyncing permissions:', error);
      dispatch(setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error resyncing user permissions',
        severity: 'error'
      }));
    } finally {
      setSyncing(null);
    }
  };

  // View user permissions
  const viewUserPermissions = async (user: User) => {
    setSelectedUser(user);
    setUserPermissions(null);
    setDialogOpen(true);
    await fetchUserPermissions(user.id);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get provider icon/color
  const getProviderInfo = (provider?: string) => {
    switch (provider) {
      case 'google':
        return { color: '#db4437', icon: '🔍' };
      case 'facebook':
        return { color: '#4267B2', icon: '📘' };
      case 'microsoft':
        return { color: '#00a1f1', icon: '🪟' };
      default:
        return { color: '#6B7280', icon: '👤' };
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        OAuth2 Permission Manager
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This page shows how OAuth2 users are automatically assigned permissions based on their email domain. 
          Users from <strong>suchdol.net</strong> get manager rights, <strong>talpa@suchdol.net</strong> gets admin rights.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Users & Permissions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const providerInfo = getProviderInfo(user.provider);
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {user.avatar ? (
                        <Box
                          component="img"
                          src={user.avatar}
                          alt={user.name}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <PersonIcon />
                      )}
                      <Typography variant="body2">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.provider || 'local'}
                      size="small"
                      sx={{ 
                        bgcolor: providerInfo.color + '20',
                        color: providerInfo.color,
                        border: `1px solid ${providerInfo.color}`
                      }}
                      icon={<span>{providerInfo.icon}</span>}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={getRoleColor(user.role) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      color={user.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => viewUserPermissions(user)}
                      title="View Permissions"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => resyncUserPermissions(user.id)}
                      disabled={syncing === user.id}
                      title="Resync Permissions"
                    >
                      {syncing === user.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SyncIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Permissions Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <SecurityIcon />
            <Box>
              <Typography variant="h6">
                {selectedUser?.name} - Effective Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {userPermissions ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {userPermissions.directPermissions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Direct Permissions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {userPermissions.groupPermissions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Group Permissions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {userPermissions.totalEffectivePermissions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Effective
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Permission Details
              </Typography>
              
              <List dense>
                {userPermissions.effectivePermissions.map((permission, index) => (
                  <React.Fragment key={permission.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">{permission.name}</Typography>
                            <Chip
                              label={permission.source}
                              size="small"
                              color={permission.source === 'direct' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                            {permission.fromGroup && (
                              <Chip
                                label={permission.fromGroup.name}
                                size="small"
                                sx={{
                                  bgcolor: permission.fromGroup.color + '20',
                                  color: permission.fromGroup.color,
                                  border: `1px solid ${permission.fromGroup.color}`
                                }}
                                icon={<GroupIcon fontSize="small" />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {permission.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Code: {permission.code} | Category: {permission.category}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < userPermissions.effectivePermissions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedUser && (
            <Button 
              onClick={() => resyncUserPermissions(selectedUser.id)}
              startIcon={<SyncIcon />}
              variant="outlined"
            >
              Resync Permissions
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OAuth2PermissionManager;