import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Person,
  Edit,
  Key,
  ContactPhone,
  Language,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setSnackbar } from '../store/slices/notificationSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  viber?: string;
  whatsapp?: string;
  signal?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  role: string;
  provider?: string;
  avatar?: string;
}

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Password change dialog
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setEditedProfile(data.data);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setEditedProfile(data.data);
        setIsEditing(false);
        dispatch(setSnackbar({
          open: true,
          message: t('profile.saveSuccess'),
          severity: 'success'
        }));
      } else {
        const error = await response.json();
        dispatch(setSnackbar({
          open: true,
          message: error.message || t('profile.saveError'),
          severity: 'error'
        }));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      dispatch(setSnackbar({
        open: true,
        message: t('profile.saveError'),
        severity: 'error'
      }));
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(setSnackbar({
        open: true,
        message: t('profile.passwordMismatch'),
        severity: 'error'
      }));
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        dispatch(setSnackbar({
          open: true,
          message: t('profile.passwordChangeSuccess'),
          severity: 'success'
        }));
      } else {
        const error = await response.json();
        dispatch(setSnackbar({
          open: true,
          message: error.message || t('profile.passwordChangeError'),
          severity: 'error'
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      dispatch(setSnackbar({
        open: true,
        message: t('profile.passwordChangeError'),
        severity: 'error'
      }));
    }
  };

  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (!profile) {
    return <Box sx={{ p: 3 }}>Profile not found</Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Person sx={{ fontSize: 40 }} />
            )}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {profile.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(`userManagement.role.${profile.role.toLowerCase()}`)}
            </Typography>
          </Box>
          <Box>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                {t('profile.edit')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                >
                  {t('profile.cancel')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  {t('profile.save')}
                </Button>
              </>
            )}
            {profile.provider === 'local' && (
              <Button
                variant="outlined"
                startIcon={<Key />}
                onClick={() => setPasswordDialog(true)}
                color="secondary"
              >
                {t('profile.changePassword')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Person />} label={t('profile.basicInfo')} />
          <Tab icon={<ContactPhone />} label={t('profile.contact')} />
          <Tab icon={<Language />} label={t('profile.social')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.name')}
                value={editedProfile?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.email')}
                value={editedProfile?.email || ''}
                disabled
                helperText={t('profile.emailReadonly')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.phone')}
                value={editedProfile?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.company')}
                value={editedProfile?.company || ''}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('profile.address')}
                value={editedProfile?.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.viber')}
                value={editedProfile?.viber || ''}
                onChange={(e) => handleFieldChange('viber', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.viberHelp')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.whatsapp')}
                value={editedProfile?.whatsapp || ''}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.whatsappHelp')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.signal')}
                value={editedProfile?.signal || ''}
                onChange={(e) => handleFieldChange('signal', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.signalHelp')}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.facebook')}
                value={editedProfile?.facebook || ''}
                onChange={(e) => handleFieldChange('facebook', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.facebookHelp')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.instagram')}
                value={editedProfile?.instagram || ''}
                onChange={(e) => handleFieldChange('instagram', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.instagramHelp')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.twitter')}
                value={editedProfile?.twitter || ''}
                onChange={(e) => handleFieldChange('twitter', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.twitterHelp')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.linkedin')}
                value={editedProfile?.linkedin || ''}
                onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                disabled={!isEditing}
                helperText={t('profile.linkedinHelp')}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('profile.changePassword')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('profile.currentPassword')}
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('profile.newPassword')}
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('profile.confirmPassword')}
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>
            {t('profile.cancel')}
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {t('profile.changePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfilePage;