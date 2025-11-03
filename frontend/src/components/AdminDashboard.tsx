import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Storage as DatabaseIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { setSnackbar } from '../store/slices/notificationSlice';
import apiClient from '../services/api';

interface DatabaseStats {
  users: number;
  species: number;
  animals: number;
  images: number;
  activeAnimals: number;
  activeUsers: number;
}

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const handleSeedDatabase = async () => {
    if (!window.confirm('Opravdu chcete vymazat všechna data a naplnit databázi testovacími daty?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/admin/seed-database');
      
      dispatch(setSnackbar({
        open: true,
        message: 'Databáze byla úspěšně naplněna testovacími daty!',
        severity: 'success'
      }));

      // Načteme nové statistiky
      loadStats();
      
    } catch (error: any) {
      console.error('Chyba při seed databáze:', error);
      dispatch(setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Nepodařilo se naplnit databázi',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async () => {
    setUploadingImages(true);
    try {
      const response = await apiClient.post('/admin/upload-images');
      
      dispatch(setSnackbar({
        open: true,
        message: `Úspěšně nahráno ${response.data.data.processedImages} obrázků!`,
        severity: 'success'
      }));

      // Načteme nové statistiky
      loadStats();
      
    } catch (error: any) {
      console.error('Chyba při uploadu obrázků:', error);
      dispatch(setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Nepodařilo se nahrát obrázky',
        severity: 'error'
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const response = await apiClient.get('/admin/database-stats');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Chyba při načítání statistik:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🛠️ Administrátorský Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Správa databáze a systému
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiky databáze */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StatsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Statistiky databáze
                </Typography>
                <Button
                  size="small"
                  onClick={loadStats}
                  disabled={statsLoading}
                  sx={{ ml: 'auto' }}
                >
                  <RefreshIcon />
                </Button>
              </Box>
              
              {statsLoading ? (
                <CircularProgress size={24} />
              ) : stats ? (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="👥 Uživatelé" 
                      secondary={`${stats.users} celkem (${stats.activeUsers} aktivních)`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="🐕 Druhy zvířat" 
                      secondary={`${stats.species} druhů`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="🐾 Zvířata" 
                      secondary={`${stats.animals} celkem (${stats.activeAnimals} aktivních)`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="📷 Obrázky" 
                      secondary={`${stats.images} nahraných souborů`}
                    />
                  </ListItem>
                </List>
              ) : (
                <Alert severity="warning">Nepodařilo se načíst statistiky</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Akce */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DatabaseIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Správa dat
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSeedDatabase}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <DatabaseIcon />}
                  fullWidth
                >
                  {loading ? 'Naplňuji databázi...' : 'Naplnit testovacími daty'}
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleUploadImages}
                  disabled={uploadingImages}
                  startIcon={uploadingImages ? <CircularProgress size={20} /> : <UploadIcon />}
                  fullWidth
                >
                  {uploadingImages ? 'Nahrávám obrázky...' : 'Nahrát skutečné obrázky'}
                </Button>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Box>
                  <Box sx={{ typography: 'body2', fontWeight: 'bold' }}>
                    Seed databáze:
                  </Box>
                  <Box sx={{ typography: 'body2' }}>
                    Vymaže všechna existující data a vytvoří nová testovací data s 5 uživateli, 8 druhy zvířat a 12 zvířaty.
                  </Box>
                  <Box sx={{ typography: 'body2', fontWeight: 'bold', mt: 1 }}>
                    Upload obrázků:
                  </Box>
                  <Box sx={{ typography: 'body2' }}>
                    Stáhne a nahraje skutečné obrázky zvířat z Unsplash pro všechna zvířata v databázi.
                  </Box>
                </Box>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Přihlašovací údaje */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔑 Testovací přihlašovací údaje
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Administrátor
                    </Typography>
                    <Box sx={{ typography: 'body2' }}>
                      📧 Email: <code>admin@petmanagement.cz</code><br />
                      🔒 Heslo: <code>password123</code><br />
                      👤 Role: <Chip label="admin" color="error" size="small" />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uživatel
                    </Typography>
                    <Box sx={{ typography: 'body2' }}>
                      📧 Email: <code>jana.novakova@email.cz</code><br />
                      🔒 Heslo: <code>password123</code><br />
                      👤 Role: <Chip label="user" color="primary" size="small" />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;