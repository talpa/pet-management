import React, { useState, useEffect } from 'react';
export {}; // Ensure this is treated as a module
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Save as SaveIcon,
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
  avatar?: string;
}

interface UserGroup {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  members?: User[];
}

interface GroupMembership {
  id: number;
  userId: number;
  userGroupId: number;
  joinedAt: string;
  addedBy?: number;
  user: User;
  userGroup: UserGroup;
}

const UserGroupMembership: React.FC = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<UserGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByGroup, setFilterByGroup] = useState<number | ''>('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, groupsRes, membershipsRes] = await Promise.all([
        apiClient.get('/users?limit=1000'),
        apiClient.get('/user-groups?limit=1000'),
        apiClient.get('/user-groups/memberships'),
      ]);

      console.log('UserGroupMembership Debug:', {
        usersData: usersRes.data.success ? usersRes.data.data.length : 'failed',
        groupsData: groupsRes.data.success ? groupsRes.data.data.length : 'failed',
        membershipsData: membershipsRes.data.success ? membershipsRes.data.data.length : 'failed',
        memberships: membershipsRes.data.data
      });

      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (groupsRes.data.success) setGroups(groupsRes.data.data);
      if (membershipsRes.data.success) setMemberships(membershipsRes.data.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch(setSnackbar({
        open: true,
        message: 'Error loading data',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get user's groups
  const getUserGroups = (userId: number): UserGroup[] => {
    const userMemberships = memberships.filter(m => m.userId === userId);
    const userGroups = userMemberships
      .map(m => m.userGroup) // Změněno z m.group na m.userGroup
      .filter(g => g); // Remove any null/undefined groups
    
    console.log(`getUserGroups for user ${userId}:`, {
      memberships: memberships.length,
      userMemberships: userMemberships.length,
      userGroups: userGroups.length,
      userGroupsData: userGroups
    });
    
    return userGroups;
  };

  // Get group's members
  const getGroupMembers = (groupId: number): User[] => {
    return memberships
      .filter(m => m.userGroupId === groupId) // Změněno z m.groupId na m.userGroupId
      .map(m => m.user)
      .filter(u => u); // Remove any null/undefined users
  };

  // Filter users based on search and group filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterByGroup === '') return true;
    
    const userGroups = getUserGroups(user.id);
    return userGroups.some(g => g.id === filterByGroup);
  });

  // Open dialog to manage user's groups
  const handleManageUserGroups = (user: User) => {
    setSelectedUser(user);
    const userGroups = getUserGroups(user.id);
    setSelectedGroups(userGroups);
    setDialogOpen(true);
  };

  // Save group memberships for user
  const handleSaveMemberships = async () => {
    if (!selectedUser) return;

    console.log('Saving memberships for user:', selectedUser.id);
    console.log('Selected groups:', selectedGroups.map(g => ({ id: g.id, name: g.name })));

    try {
      const requestBody = {
        groupIds: selectedGroups.map(g => g.id),
      };
      
      console.log('Request body:', requestBody);

      const response = await apiClient.put(`/user-groups/memberships/user/${selectedUser.id}`, requestBody);

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        dispatch(setSnackbar({
          open: true,
          message: 'Group memberships updated successfully',
          severity: 'success'
        }));
        setDialogOpen(false);
        setSelectedUser(null);
        setSelectedGroups([]);
        console.log('Refreshing data...');
        fetchData(); // Refresh data
      } else {
        dispatch(setSnackbar({
          open: true,
          message: response.data.message || 'Failed to update group memberships',
          severity: 'error'
        }));
      }
    } catch (error) {
      console.error('Error updating memberships:', error);
      dispatch(setSnackbar({
        open: true,
        message: 'Error updating group memberships',
        severity: 'error'
      }));
    }
  };

  // Quick add/remove user to/from group
  const handleQuickToggleMembership = async (userId: number, groupId: number, isCurrentlyMember: boolean) => {
    try {
      if (isCurrentlyMember) {
        // Remove user from group
        await apiClient.delete(`/user-groups/${groupId}/members/${userId}`);
      } else {
        // Add user to group
        await apiClient.post(`/user-groups/${groupId}/members`, { userId });
      }

      dispatch(setSnackbar({
        open: true,
        message: `User ${isCurrentlyMember ? 'removed from' : 'added to'} group successfully`,
        severity: 'success'
      }));
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error toggling membership:', error);
      
      const errorMessage = error.response?.data?.message || 
                          `Failed to ${isCurrentlyMember ? 'remove user from' : 'add user to'} group`;
      
      dispatch(setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      }));
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
        User Group Memberships
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage which users belong to which groups. Assign users to groups to grant them group permissions.
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by group</InputLabel>
              <Select
                value={filterByGroup}
                label="Filter by group"
                onChange={(e) => setFilterByGroup(e.target.value as number | '')}
              >
                <MenuItem value="">All users</MenuItem>
                {groups.map(group => (
                  <MenuItem key={group.id} value={group.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: group.color, width: 20, height: 20 }}>
                        <GroupIcon fontSize="small" />
                      </Avatar>
                      {group.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {filteredUsers.length} users
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Users List */}
      <Grid container spacing={2}>
        {filteredUsers.map((user) => {
          const userGroups = getUserGroups(user.id);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.avatar ? (
                        <Box
                          component="img"
                          src={user.avatar}
                          alt={user.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Groups ({userGroups.length})
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                      {userGroups.map((group) => (
                        <Chip
                          key={group.id}
                          label={group.name}
                          size="small"
                          sx={{ 
                            bgcolor: group.color + '20', 
                            border: `1px solid ${group.color}`,
                            color: group.color 
                          }}
                          onDelete={() => handleQuickToggleMembership(user.id, group.id, true)}
                          deleteIcon={<CloseIcon />}
                        />
                      ))}
                      {userGroups.length === 0 && (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          No groups assigned
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupIcon />}
                    onClick={() => handleManageUserGroups(user)}
                  >
                    Manage Groups
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredUsers.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterByGroup ? 'Try adjusting your search or filter criteria.' : 'No users available.'}
          </Typography>
        </Paper>
      )}

      {/* Group Management Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar>
              {selectedUser?.avatar ? (
                <Box
                  component="img"
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                selectedUser?.name.charAt(0)
              )}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedUser?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Select groups for this user:
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Users inherit all permissions from their assigned groups. Select groups carefully.
          </Alert>

          <Stack spacing={1}>
            {groups.map((group) => {
              const isSelected = selectedGroups.some(sg => sg.id === group.id);
              
              return (
                <Paper key={group.id} variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, group]);
                        } else {
                          setSelectedGroups(selectedGroups.filter(sg => sg.id !== group.id));
                        }
                      }}
                    />
                    <Avatar sx={{ bgcolor: group.color, width: 32, height: 32 }}>
                      <GroupIcon fontSize="small" />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2">{group.name}</Typography>
                      {group.description && (
                        <Typography variant="body2" color="text.secondary">
                          {group.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {getGroupMembers(group.id).length} members
                      </Typography>
                    </Box>
                    <Chip
                      label={group.isActive ? 'Active' : 'Inactive'}
                      color={group.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Paper>
              );
            })}
          </Stack>

          {groups.length === 0 && (
            <Alert severity="warning">
              No groups available. Create groups first to assign users to them.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveMemberships} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserGroupMembership;