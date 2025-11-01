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
  Paper
} from '@mui/material';
import { 
  Login as LoginIcon, 
  Pets as PetsIcon,
  Visibility as VisibilityIcon
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    loadRecentAnimals();
  }, [selectedTags]);

  const loadRecentAnimals = async () => {
    try {
      setLoading(true);
      // Načteme posledních 12 zvířat seřazených podle data vytvoření
      const tagsParam = selectedTags.length > 0 ? `&tags=${selectedTags.join(',')}` : '';
      const response = await apiClient.get(`/animals?page=1&limit=12&sortBy=created_at&sortOrder=DESC${tagsParam}`);
      setAnimals(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load recent animals:', err);
      setError('Nepodařilo se načíst zvířata');
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    if (animal.seoUrl) {
      navigate(`/animal/${animal.seoUrl}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Neznámé datum';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Neplatné datum';
    return date.toLocaleDateString('cs-CZ');
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'}`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'měsíc' : months < 5 ? 'měsíce' : 'měsíců'}`;
    } else {
      return 'méně než měsíc';
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
            🐾 Pet Management System
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Moderní systém pro správu domácích mazlíčků a jejich údajů
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
              Přihlásit se do systému
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
              Moje zvířata
            </Button>
          )}
        </Container>
      </Box>

      {/* Recent Animals Gallery */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            🏆 Naposledy přidaná zvířata
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Nejnovější příspěvky v našem systému
          </Typography>
        </Box>

        {/* Tag Filter */}
        <TagFilter
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          showTitle={true}
          maxTagsVisible={15}
        />

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
                          Přidáno: {formatDate(animal.created_at)}
                        </Typography>
                        
                        {animal.seoUrl && (
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption">
                              Klikněte pro detail
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
            <Typography variant="h6" color="text.secondary">
              Zatím nebyla přidána žádná zvířata
            </Typography>
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
                  Správa zvířat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kompletní systém pro evidenci domácích mazlíčků s fotografiemi, vlastnostmi a historií
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: 50, mb: 2 }}>📊</Typography>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vlastnosti a údaje
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sledování zdravotních údajů, vakcinací, měření a dalších důležitých informací
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ fontSize: 50, mb: 2 }}>🔗</Typography>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Veřejné profily
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Každé zvíře má vlastní veřejnou stránku s jedinečnou URL adresou
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