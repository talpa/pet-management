import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers, UserState } from '../store/userSlice';
import { User } from '../types/User';
import {
  fetchPermissions,
  fetchUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  fetchCategories,
  PermissionState,
} from '../store/permissionSlice';
import { Permission, UserPermission } from '../types/Permission';

const UserPermissionsManagement: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user as UserState);
  const { permissions, userPermissions, categories, loading } = useSelector(
    (state: RootState) => state.permission as PermissionState
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPermissions());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchUserPermissions(selectedUser.id));
    }
  }, [selectedUser, dispatch]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleGrantPermission = async () => {
    if (!selectedUser || !selectedPermission) return;

    try {
      await dispatch(grantUserPermission({
        userId: selectedUser.id,
        permissionId: selectedPermission as number,
        grantedBy: 1, // TODO: Get current user ID
        expiresAt: expiresAt || undefined,
      })).unwrap();
      
      setOpenDialog(false);
      setSelectedPermission('');
      setExpiresAt('');
    } catch (error) {
      console.error('Failed to grant permission:', error);
    }
  };

  const handleRevokePermission = async (permissionId: number) => {
    if (!selectedUser) return;

    try {
      await dispatch(revokeUserPermission({
        userId: selectedUser.id,
        permissionId,
      })).unwrap();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    }
  };

  const getUserPermissionByPermissionId = (permissionId: number): UserPermission | undefined => {
    return userPermissions.find(up => up.permissionId === permissionId);
  };

  const getPermissionsByCategory = (category: string): Permission[] => {
    return permissions.filter(p => p.category === category);
  };

  const isPermissionGranted = (permissionId: number): boolean => {
    return userPermissions.some(up => up.permissionId === permissionId && up.granted);
  };

  const availablePermissions = permissions.filter(
    p => !userPermissions.some(up => up.permissionId === p.id)
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        {t('permissions.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Users List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('permissions.selectUser')}
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {users?.map((user) => (
                  <Paper
                    key={user.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedUser?.id === user.id ? 'primary.light' : 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                    onClick={() => handleUserSelect(user)}
                  >
                    <Typography variant="subtitle1">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={user.role}
                      color={user.status === 'active' ? 'success' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions Management */}
        <Grid item xs={12} md={8}>
          {selectedUser ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {t('permissions.permissionsFor', { name: selectedUser.name })}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    disabled={availablePermissions.length === 0}
                  >
                    {t('permissions.grantPermission')}
                  </Button>
                </Box>

                {categories.map((category) => {
                  const categoryPermissions = getPermissionsByCategory(category);
                  if (categoryPermissions.length === 0) return null;

                  return (
                    <Box key={category} sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
                        {t('permissions.permissionsCategory', { category })}
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('permissions.permission')}</TableCell>
                              <TableCell>{t('permissions.description')}</TableCell>
                              <TableCell>{t('permissions.status')}</TableCell>
                              <TableCell>{t('permissions.grantedBy')}</TableCell>
                              <TableCell>{t('permissions.actions')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryPermissions.map((permission) => {
                              const userPermission = getUserPermissionByPermissionId(permission.id);
                              const granted = isPermissionGranted(permission.id);

                              return (
                                <TableRow key={permission.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      {permission.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.code}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {permission.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      icon={granted ? <CheckIcon /> : <CloseIcon />}
                                      label={granted ? t('permissions.granted') : t('permissions.notGranted')}
                                      color={granted ? 'success' : 'default'}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {userPermission?.grantedByUser ? (
                                      <Typography variant="body2">
                                        {userPermission.grantedByUser.name}
                                      </Typography>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        -
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {granted ? (
                                      <Tooltip title="Revoke Permission">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleRevokePermission(permission.id)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Grant Permission">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() => {
                                            setSelectedPermission(permission.id);
                                            setOpenDialog(true);
                                          }}
                                        >
                                          <AddIcon />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}

                {userPermissions.length === 0 && (
                  <Alert severity="info">
                    {t('permissions.noPermissions')}
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" textAlign="center">
                  {t('permissions.selectUserPrompt')}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Grant Permission Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('permissions.grantPermissionDialog')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('permissions.permission')}</InputLabel>
              <Select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as number | '')}
                label={t('permissions.permission')}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.id}>
                    <Box>
                      <Typography variant="body1">{permission.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {permission.code} - {permission.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('permissions.expiresAt')}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={t('permissions.permanentPermission')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('permissions.cancel')}</Button>
          <Button
            onClick={handleGrantPermission}
            variant="contained"
            disabled={!selectedPermission}
          >
            {t('permissions.grantPermission')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserPermissionsManagement;