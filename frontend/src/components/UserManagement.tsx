import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  TableSortLabel,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person as PersonIcon,
  Key,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers, createUser, updateUser, deleteUser, UserState } from '../store/userSlice';
import { setSearchTerm, setSortColumn, setCurrentPage, setItemsPerPage, DataState } from '../store/dataSlice';
import { User } from '../types/User';
import ViewModeToggle from './ViewModeToggle';
import { useTranslation } from 'react-i18next';
import { setSnackbar } from '../store/slices/notificationSlice';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.user as UserState);
  const { searchTerm, sortColumn, sortDirection, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.data as DataState
  );

  console.log('UserManagement render:', { 
    users: users, 
    usersLength: users?.length, 
    loading, 
    error,
    searchTerm,
    currentPage 
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('userViewMode') as 'grid' | 'list') || 'list';
  });
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'user', // Výchozí role pro nové uživatele
    status: 'active',
  });

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    localStorage.setItem('userViewMode', newMode);
  };

  useEffect(() => {
    console.log('UserManagement useEffect - fetching users...');
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    dispatch(setSortColumn({ column, direction }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(setCurrentPage(newPage + 1));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setItemsPerPage(parseInt(event.target.value, 10)));
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: 'user', // Výchozí role pro nové uživatele
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleOpenPasswordDialog = (user: User) => {
    setPasswordUser(user);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordUser(null);
    setNewPassword('');
  };

  const handleChangePassword = async () => {
    if (!passwordUser || !newPassword) return;

    try {
      const response = await fetch(`/api/users/${passwordUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        handleClosePasswordDialog();
        dispatch(setSnackbar({
          open: true,
          message: t('userManagement.changePassword.success'),
          severity: 'success'
        }));
      } else {
        const error = await response.json();
        console.error('Error changing password:', error);
        dispatch(setSnackbar({
          open: true,
          message: t('userManagement.changePassword.error'),
          severity: 'error'
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      dispatch(setSnackbar({
        open: true,
        message: t('userManagement.changePassword.error'),
        severity: 'error'
      }));
    }
  };

  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log('=== UserManagement handleSubmit ===');
      console.log('editingUser:', editingUser);
      console.log('formData:', formData);
      
      if (editingUser) {
        console.log('Updating user with ID:', editingUser.id, 'userData:', formData);
        const result = await dispatch(updateUser({ id: editingUser.id, userData: formData }));
        console.log('Update result:', result);
      } else {
        console.log('Creating new user with data:', formData);
        const result = await dispatch(createUser(formData));
        console.log('Create result:', result);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = (users || []).filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug informace
  console.log('Debug UserManagement:', {
    totalUsers: users?.length || 0,
    filteredUsers: filteredUsers.length,
    searchTerm,
    currentPage,
    itemsPerPage,
    users: users
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ViewModeToggle 
              viewMode={viewMode} 
              onModeChange={handleViewModeChange}
              gridTooltip="Kaskádový pohled"
              listTooltip="Seznamový pohled"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Přidat uživatele
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'name'}
                    direction={sortColumn === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'admin' ? 'Admin' : 'User'}
                      color={user.role === 'admin' ? 'error' : 'primary'}
                      size="small"
                      icon={user.role === 'admin' ? <span>👑</span> : <span>👤</span>}
                    />
                  </TableCell>
                  <TableCell>{user.company || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    {user.provider === 'local' && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPasswordDialog(user)}
                        color="secondary"
                        title={t('userManagement.changePassword.tooltip')}
                      >
                        <Key />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={itemsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {paginatedUsers.map((user: User) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main', mr: 2 }}
                        title={`${user.name} - ${user.role}`}
                        aria-label={`${user.name} profile, role: ${user.role}`}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {user.name}
                        </Typography>
                        <Chip
                          label={user.role === 'admin' ? 'Admin' : 'User'}
                          color={user.role === 'admin' ? 'error' : 'primary'}
                          size="small"
                          icon={user.role === 'admin' ? <span>👑</span> : <span>👤</span>}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Telefon:</strong> {user.phone || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Společnost:</strong> {user.company || '-'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Upravit uživatele">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {user.provider === 'local' && (
                      <Tooltip title={t('userManagement.changePassword.tooltip')}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPasswordDialog(user)}
                          color="secondary"
                        >
                          <Key />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Smazat uživatele">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={currentPage - 1}
              onPageChange={handlePageChange}
              rowsPerPage={itemsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? `Upravit uživatele: ${editingUser.name}` : 'Přidat nového uživatele'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => handleFormChange('company', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="user">User (Uživatel)</MenuItem>
                  <MenuItem value="admin">Admin (Administrátor)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value as 'active' | 'inactive')}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Zrušit</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Uložit změny' : 'Vytvořit uživatele'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('userManagement.changePassword.title')}: {passwordUser?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('userManagement.changePassword.description')}
          </Typography>
          <TextField
            fullWidth
            label={t('userManagement.changePassword.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>{t('userManagement.changePassword.cancel')}</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={!newPassword || newPassword.length < 6}
          >
            {t('userManagement.changePassword.button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;