import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Fab,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pets as PetsIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAppSelector } from '../store/hooks';
import AdminLayout from './AdminLayout';
import ViewModeToggle from './ViewModeToggle';
import apiClient from '../services/api';

interface AnimalSpecies {
  id: number;
  name: string;
  category: string;
}

interface AnimalImage {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
}

interface Animal {
  id: number;
  name: string;
  species: AnimalSpecies;
  ownerId: number;
  birthDate?: string;
  gender?: string;
  description?: string;
  seoUrl?: string;
  images: AnimalImage[];
  created_at: string;
}

const MyAnimalsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMyAnimals();
  }, [searchTerm]); // Reload when search term changes

  const loadMyAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading animals for user:', user);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      // Pro admina: načteme všechna zvířata
      // Pro běžné uživatele: použijeme nový endpoint /animals/my
      let response;
      if (user && user.role === 'admin') {
        response = await apiClient.get(`/animals?${params.toString()}`);
      } else {
        response = await apiClient.get(`/animals/my?${params.toString()}`);
      }
      
      const animals = response.data.data || [];
      console.log(`Loaded ${animals.length} animals from backend`);
      
      setAnimals(animals);
    } catch (err: any) {
      console.error('Failed to load my animals:', err);
      setError(t('errors.failedToLoadAnimals'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    if (animal.seoUrl) {
      navigate(`/animal/${animal.seoUrl}`);
    }
  };

  const handleEditAnimal = (animalId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/animals/${animalId}/edit`);
  };

  const handleDeleteAnimal = async (animalId: number, animalName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm(t('confirmations.deleteAnimal', { name: animalName }))) {
      try {
        await apiClient.delete(`/animals/${animalId}`);
        setAnimals(animals.filter(a => a.id !== animalId));
      } catch (err: any) {
        console.error('Failed to delete animal:', err);
        setError(t('errors.failedToDeleteAnimal'));
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.unknownDate');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('common.invalidDate');
    // Use proper locale based on i18n language
    const locale = i18n.language === 'cs' ? 'cs-CZ' : 'en-US';
    return date.toLocaleDateString(locale);
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return t('age.years', { count: years });
    } else if (months > 0) {
      return t('age.months', { count: months });
    } else {
      return t('age.lessThanMonth');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AdminLayout title={isAdmin ? t('pages.adminAnimals') : t('pages.myAnimals')}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isAdmin ? `🔧 ${t('pages.adminAnimals')}` : `🐾 ${t('pages.myAnimals')}`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isAdmin 
            ? t('descriptions.adminAnimalsManagement')
            : t('descriptions.myAnimalsDescription')
          }
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search and View Controls */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {animals.length > 0 ? t('common.searchAndFilter') : t('common.controls')}
            </Typography>
            {animals.length > 0 && (
              <ViewModeToggle
                viewMode={viewMode}
                onModeChange={setViewMode}
                gridTooltip={t('viewMode.gridTooltip')}
                listTooltip={t('viewMode.listTooltip')}
              />
            )}
          </Box>
          
          <TextField
            fullWidth
            placeholder={isAdmin ? t('search.searchAllAnimals') : t('search.searchMyAnimals')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setSearchTerm('')}
                    size="small"
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={50} />
          </Box>
        ) : (
          <>
            {animals.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PetsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {isAdmin ? t('emptyStates.noAnimalsAdmin') : t('emptyStates.noAnimalsUser')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isAdmin 
                    ? t('emptyStates.noAnimalsAdminDesc')
                    : t('emptyStates.noAnimalsUserDesc')
                  }
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/animals/new')}
                  size="large"
                >
                  {isAdmin ? t('actions.addAnimal') : t('actions.addMyPet')}
                </Button>
              </Paper>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <Grid container spacing={3}>
                    {animals.map((animal) => {
                      const primaryImage = animal.images?.find(img => img.isPrimary) || animal.images?.[0];
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                          <Card 
                            sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <CardActionArea 
                              onClick={() => handleAnimalClick(animal)}
                              sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                            >
                              {primaryImage ? (
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={primaryImage.url}
                                  alt={animal.name}
                                  sx={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    height: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.200',
                                    color: 'grey.600'
                                  }}
                                >
                                  <PetsIcon sx={{ fontSize: 60 }} />
                                </Box>
                              )}
                              
                              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                                  {animal.name}
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Chip
                                    label={animal.species.name}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                  <Chip
                                    label={animal.species.category}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                  />
                                </Box>
                                
                                {animal.birthDate && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    📅 {calculateAge(animal.birthDate)}
                                  </Typography>
                                )}
                                
                                {animal.gender && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    ⚥ {animal.gender}
                                  </Typography>
                                )}
                                
                                <Typography variant="caption" color="text.secondary">
                                  {t('common.addedOn')}: {formatDate(animal.created_at)}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            
                            {/* Action buttons */}
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  color: 'primary.main',
                                  cursor: 'pointer',
                                  '&:hover': { color: 'primary.dark' }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnimalClick(animal);
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption">
                                  {t('actions.viewDetail')}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleEditAnimal(animal.id, e)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDeleteAnimal(animal.id, animal.name, e)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Paper>
                    <List>
                      {animals.map((animal, index) => {
                        const primaryImage = animal.images?.find(img => img.isPrimary) || animal.images?.[0];
                        
                        return (
                          <React.Fragment key={animal.id}>
                            <ListItem
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                              onClick={() => handleAnimalClick(animal)}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  src={primaryImage?.thumbnailUrl || primaryImage?.url}
                                  sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    mr: 1,
                                    bgcolor: primaryImage ? 'transparent' : 'grey.200'
                                  }}
                                >
                                  {!primaryImage && <PetsIcon />}
                                </Avatar>
                              </ListItemAvatar>
                              
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                                      {animal.name}
                                    </Typography>
                                    <Chip
                                      label={animal.species.name}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={animal.species.category}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    {animal.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {animal.description.length > 100 
                                          ? `${animal.description.substring(0, 100)}...` 
                                          : animal.description
                                        }
                                      </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                      {animal.birthDate && (
                                        <Typography variant="body2" color="text.secondary">
                                          📅 {calculateAge(animal.birthDate)}
                                        </Typography>
                                      )}
                                      {animal.gender && (
                                        <Typography variant="body2" color="text.secondary">
                                          ⚥ {animal.gender}
                                        </Typography>
                                      )}
                                      <Typography variant="body2" color="text.secondary">
                                        {t('common.addedOn')}: {formatDate(animal.created_at)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                              
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAnimalClick(animal);
                                    }}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleEditAnimal(animal.id, e)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDeleteAnimal(animal.id, animal.name, e)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < animals.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Paper>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Floating Action Button pro přidání nového zvířete */}
      <Fab
        color="primary"
        aria-label="add animal"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        onClick={() => navigate('/animals/new')}
      >
        <AddIcon />
      </Fab>
    </AdminLayout>
  );
};

export default MyAnimalsPage;