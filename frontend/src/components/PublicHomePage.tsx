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
  Container,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Login as LoginIcon, 
  Pets as PetsIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import PublicLayout from './PublicLayout';
import apiClient from '../services/api';
import TagFilter from './TagFilter';

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

interface AnimalOwner {
  id: number;
  name: string;
  email: string;
}

interface Animal {
  id: number;
  name: string;
  species: AnimalSpecies;
  owner: AnimalOwner;
  birthDate?: string;
  description?: string;
  seoUrl?: string;
  images: AnimalImage[];
  tags?: { id: number; name: string; color?: string }[];
  created_at: string;
}

const PublicHomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Helper function for Czech animal word declension
  const getAnimalCountText = (count: number) => {
    if (count === 1) {
      return t('home.animalSingular');
    } else if (count >= 2 && count <= 4) {
      return t('home.animalPlural');
    } else {
      return t('home.animalGenitive');
    }
  };

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [species, setSpecies] = useState<AnimalSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | ''>('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Helper function to get contrast color for text readability
  const getContrastColor = (backgroundColor: string): string => {
    if (!backgroundColor) return '#000000';
    
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  useEffect(() => {
    loadRecentAnimals();
  }, [selectedTags, searchTerm, selectedSpeciesId]);

  const loadSpecies = async () => {
    try {
      const response = await apiClient.get('/animal/species');
      setSpecies(response.data.data);
    } catch (err: any) {
      console.error('Failed to load species:', err);
    }
  };

  const loadRecentAnimals = async () => {
    try {
      setLoading(true);
      
      // Sestavíme parametry pro API call
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (selectedSpeciesId) {
        params.append('speciesId', selectedSpeciesId.toString());
      }

      const response = await apiClient.get(`/animals?${params.toString()}`);
      setAnimals(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load recent animals:', err);
      setError(t('home.errorLoadingAnimals'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    if (animal.seoUrl) {
      navigate(`/animal/${animal.seoUrl}`);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSpeciesId('');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchTerm.trim() || selectedSpeciesId || selectedTags.length > 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return t('home.unknownDate');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('home.invalidDate');
    return date.toLocaleDateString(i18n.language === 'cs' ? 'cs-CZ' : 'en-US');
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years > 0) {
      let yearText;
      if (years === 1) {
        yearText = t('home.age.year');
      } else if (years >= 2 && years <= 4) {
        yearText = t('home.age.years2to4');
      } else {
        yearText = t('home.age.years5plus');
      }
      return `${years} ${yearText}`;
    } else if (months > 0) {
      let monthText;
      if (months === 1) {
        monthText = t('home.age.month');
      } else if (months >= 2 && months <= 4) {
        monthText = t('home.age.months2to4');
      } else {
        monthText = t('home.age.months5plus');
      }
      return `${months} ${monthText}`;
    } else {
      return t('home.age.lessThanMonth');
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
          background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            🐾 {t('home.title')}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            {t('home.heroSubtitle')}
          </Typography>
          {!isAuthenticated && (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              {t('home.loginToSystem')}
            </Button>
          )}
          {isAuthenticated && (
            <Button
              component={Link}
              to="/my-animals"
              variant="contained"
              size="large"
              startIcon={<PetsIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              {t('navigation.myAnimals')}
            </Button>
          )}
        </Container>
      </Box>

      {/* Recent Animals Gallery */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {hasActiveFilters ? t('home.searchResultsTitle') : t('home.recentAnimalsTitle')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {hasActiveFilters 
              ? t('home.searchResultsCount', { 
                  count: animals.length, 
                  countText: getAnimalCountText(animals.length) 
                })
              : t('home.recentAnimalsSubtitle')
            }
          </Typography>
        </Box>

        {/* Advanced Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Filter Header with Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterIcon color="primary" />
              <Typography variant="h6" component="h3">
                {t('home.filteringAndSearch')}
              </Typography>
              {hasActiveFilters && (
                <Chip 
                  label={t('home.activeFiltersCount', {
                    count: (searchTerm.trim() ? 1 : 0) + 
                           (selectedSpeciesId ? 1 : 0) + 
                           selectedTags.length
                  })}
                  size="small" 
                  color="primary"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {hasActiveFilters && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  size="small"
                  color="secondary"
                >
                  {t('home.clearFilters')}
                </Button>
              )}
              <IconButton
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                aria-label="toggle filters"
              >
                <ExpandMoreIcon 
                  sx={{ 
                    transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }} 
                />
              </IconButton>
            </Box>
          </Box>

          {/* Always visible search bar */}
          <TextField
            fullWidth
            placeholder={t('home.searchPlaceholder')}
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
            sx={{ mb: filtersExpanded ? 3 : 0 }}
          />

          {/* Collapsible Additional Filters */}
          <Collapse in={filtersExpanded}>
            <Box sx={{ pt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {/* Species Filter */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('home.filterBySpecies')}</InputLabel>
                    <Select
                      value={selectedSpeciesId}
                      onChange={(e) => setSelectedSpeciesId(e.target.value as number | '')}
                      label={t('home.filterBySpecies')}
                    >
                      <MenuItem value="">
                        <em>{t('home.allSpecies')}</em>
                      </MenuItem>
                      {species.map((speciesItem) => (
                        <MenuItem key={speciesItem.id} value={speciesItem.id}>
                          {speciesItem.name} ({speciesItem.category})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Tag Filter */}
                <Grid item xs={12} sm={6} md={8}>
                  <TagFilter
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    showTitle={false}
                    maxTagsVisible={20}
                  />
                </Grid>
              </Grid>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('home.activeFilters')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {searchTerm.trim() && (
                      <Chip
                        label={`${t('home.searchLabel')} "${searchTerm.trim()}"`}
                        onDelete={() => setSearchTerm('')}
                        size="small"
                        color="primary"
                      />
                    )}
                    {selectedSpeciesId && (
                      <Chip
                        label={`${t('home.speciesLabel')} ${species.find(s => s.id === selectedSpeciesId)?.name}`}
                        onDelete={() => setSelectedSpeciesId('')}
                        size="small"
                        color="secondary"
                      />
                    )}
                    {selectedTags.map((tagId) => (
                      <Chip
                        key={tagId}
                        label={`Tag: ${tagId}`}
                        onDelete={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                        size="small"
                        color="default"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={50} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {animals.map((animal) => {
              const primaryImage = animal.images?.find(img => img.isPrimary) || animal.images?.[0];
              
              // Debug log
              console.log('Animal:', animal.name, 'Images:', animal.images, 'Primary:', primaryImage);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: animal.seoUrl ? 'pointer' : 'default',
                      '&:hover': animal.seoUrl ? {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      } : {}
                    }}
                  >
                    <CardActionArea 
                      onClick={() => handleAnimalClick(animal)}
                      disabled={!animal.seoUrl}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      {primaryImage ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={primaryImage.url}
                          alt={animal.name}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Image failed to load:', primaryImage.url, e);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', primaryImage.url);
                          }}
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
                        
                        {animal.tags && animal.tags.length > 0 && (
                          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {animal.tags.slice(0, 3).map((tag) => (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                sx={{
                                  backgroundColor: tag.color || '#e0e0e0',
                                  color: getContrastColor(tag.color || '#e0e0e0'),
                                  fontSize: '0.7rem',
                                  height: '18px',
                                }}
                              />
                            ))}
                            {animal.tags.length > 3 && (
                              <Chip
                                label={`+${animal.tags.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '18px' }}
                              />
                            )}
                          </Box>
                        )}
                        
                        {animal.birthDate && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📅 {calculateAge(animal.birthDate)}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          👤 {animal.owner.name}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {t('home.addedOn')} {formatDate(animal.created_at)}
                        </Typography>
                        
                        {animal.seoUrl && (
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption">
                              {t('home.clickForDetail')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {animals.length === 0 && !loading && !error && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PetsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hasActiveFilters 
                ? t('home.noAnimalsFound')
                : t('home.noAnimalsYet')
              }
            </Typography>
            {hasActiveFilters && (
              <Button 
                onClick={clearAllFilters}
                startIcon={<ClearIcon />}
                sx={{ mt: 2 }}
              >
                {t('home.clearAllFilters')}
              </Button>
            )}
          </Paper>
        )}
      </Container>

      {/* Info Cards */}
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <PetsIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('home.infoCards.management.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.infoCards.management.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: 50, mb: 2 }}>📊</Typography>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('home.infoCards.tracking.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.infoCards.tracking.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: 50, mb: 2 }}>🔗</Typography>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('home.infoCards.profiles.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('home.infoCards.profiles.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
};

export default PublicHomePage;