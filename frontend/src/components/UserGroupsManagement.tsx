import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Fab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { setSnackbar } from '../store/slices/notificationSlice';
import apiClient from '../services/api';

interface UserGroup {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdBy?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  members?: any[];
  permissions?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

const UserGroupsManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    isActive: true,
  });

  // Fetch user groups
  const fetchUserGroups = async () => {
    try {
      const response = await apiClient.get('/user-groups');
      
      if (response.data.success) {
        setUserGroups(response.data.data);
      } else {
        dispatch(setSnackbar({ 
          open: true, 
          message: response.data.message || 'Failed to fetch user groups', 
          severity: 'error' 
        }));
      }
    } catch (error: any) {
      dispatch(setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error fetching user groups', 
        severity: 'error' 
      }));
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await apiClient.get('/permissions');
      
      if (response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserGroups(), fetchPermissions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, group: UserGroup) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6B7280',
      isActive: true,
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedGroup) {
      setFormData({
        name: selectedGroup.name,
        description: selectedGroup.description || '',
        color: selectedGroup.color,
        isActive: selectedGroup.isActive,
      });
      setIsEditing(true);
      setDialogOpen(true);
      // Don't close the menu yet - selectedGroup needs to stay for handleSubmit
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    // Don't close the menu yet - selectedGroup needs to stay for handleDeleteConfirm
  };

  const handleViewDetails = () => {
    setDetailsDialogOpen(true);
    // Don't close the menu yet - selectedGroup needs to stay for the details dialog
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/user-groups/${selectedGroup?.id}` : '/user-groups';
      const method = isEditing ? 'put' : 'post';
      
      const response = await apiClient[method](url, formData);
      
      if (response.data.success) {
        dispatch(setSnackbar({ 
          open: true, 
          message: response.data.message || `User group ${isEditing ? 'updated' : 'created'} successfully`, 
          severity: 'success' 
        }));
        setDialogOpen(false);
        handleMenuClose(); // Close menu after successful operation
        fetchUserGroups();
      } else {
        dispatch(setSnackbar({ 
          open: true, 
          message: response.data.message || `Failed to ${isEditing ? 'update' : 'create'} user group`, 
          severity: 'error' 
        }));
      }
    } catch (error: any) {
      dispatch(setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} user group`, 
        severity: 'error' 
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await apiClient.delete(`/user-groups/${selectedGroup.id}`);
      
      if (response.data.success) {
        dispatch(setSnackbar({ 
          open: true, 
          message: 'User group deleted successfully', 
          severity: 'success' 
        }));
        setDeleteDialogOpen(false);
        handleMenuClose(); // Close menu after successful operation
        fetchUserGroups();
      } else {
        dispatch(setSnackbar({ 
          open: true, 
          message: response.data.message || 'Failed to delete user group', 
          severity: 'error' 
        }));
      }
    } catch (error: any) {
      dispatch(setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error deleting user group', 
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Groups Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Group
        </Button>
      </Box>

      <Grid container spacing={3}>
        {userGroups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: `3px solid ${group.color}`,
                opacity: group.isActive ? 1 : 0.6,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: group.color, width: 32, height: 32 }}>
                      <GroupIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" component="h2">
                      {group.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, group)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {group.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {group.description}
                  </Typography>
                )}

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${group.members?.length || 0} members`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<SecurityIcon />}
                    label={`${group.permissions?.length || 0} permissions`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={group.isActive ? 'Active' : 'Inactive'}
                    color={group.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  {group.creator && (
                    <Typography variant="caption" color="text.secondary">
                      by {group.creator.name}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <PeopleIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Group
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Group
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); handleMenuClose(); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit User Group' : 'Create New User Group'}
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              margin="normal"
              InputProps={{
                sx: { height: 56 },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active Group"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedGroup && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: selectedGroup.color }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedGroup.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {new Date(selectedGroup.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedGroup.description && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {selectedGroup.description}
                </Alert>
              )}
              
              <Typography variant="h6" gutterBottom>
                Members ({selectedGroup.members?.length || 0})
              </Typography>
              <List dense>
                {selectedGroup.members?.map((member: any) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Avatar>{member.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={member.email}
                    />
                  </ListItem>
                ))}
                {(!selectedGroup.members || selectedGroup.members.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary="No members"
                      secondary="This group has no members yet"
                    />
                  </ListItem>
                )}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Permissions ({selectedGroup.permissions?.length || 0})
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedGroup.permissions?.map((permission: any) => (
                  <Chip
                    key={permission.id}
                    label={permission.name}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {(!selectedGroup.permissions || selectedGroup.permissions.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No permissions assigned to this group
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); handleMenuClose(); }}>
        <DialogTitle>Delete User Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the group "{selectedGroup?.name}"? 
            This action cannot be undone and will remove all members and permissions from this group.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserGroupsManagement;