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
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pets as PetsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import AdminLayout from './AdminLayout';
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

  useEffect(() => {
    loadMyAnimals();
  }, []);

  const loadMyAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading animals for user:', user);
      
      // Pro admina: načteme všechna zvířata
      // Pro běžné uživatele: použijeme nový endpoint /animals/my
      let response;
      if (user && user.role === 'admin') {
        response = await apiClient.get('/animals?page=1&limit=100&sortBy=name&sortOrder=ASC');
      } else {
        response = await apiClient.get('/animals/my?page=1&limit=100&sortBy=name&sortOrder=ASC');
      }
      
      const animals = response.data.data || [];
      console.log(`Loaded ${animals.length} animals from backend`);
      
      setAnimals(animals);
    } catch (err: any) {
      console.error('Failed to load my animals:', err);
      setError('Nepodařilo se načíst vaše zvířata');
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
    
    if (window.confirm(`Opravdu chcete smazat zvíře "${animalName}"? Tato akce je nevratná.`)) {
      try {
        await apiClient.delete(`/animals/${animalId}`);
        setAnimals(animals.filter(a => a.id !== animalId));
      } catch (err: any) {
        console.error('Failed to delete animal:', err);
        setError('Nepodařilo se smazat zvíře');
      }
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

  const isAdmin = user?.role === 'admin';

  return (
    <AdminLayout title={isAdmin ? "Správa všech zvířat" : "Moje zvířata"}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isAdmin ? "🔧 Správa všech zvířat" : "🐾 Moje zvířata"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isAdmin 
            ? "Jako administrátor můžete spravovat všechna zvířata v systému"
            : "Zde najdete všechna svá registrovaná zvířata"
          }
        </Typography>

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
          <>
            {animals.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PetsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {isAdmin ? "V systému zatím nejsou žádná zvířata" : "Zatím nemáte registrovaná žádná zvířata"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isAdmin 
                    ? "Nová zvířata můžete přidat pomocí tlačítka níže nebo importovat testovací data"
                    : "Začněte přidáním svého prvního domácího mazlíčka"
                  }
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/animals/new')}
                  size="large"
                >
                  Přidat {isAdmin ? 'zvíře' : 'mého mazlíčka'}
                </Button>
              </Paper>
            ) : (
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
                              Přidáno: {formatDate(animal.created_at)}
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
                              Zobrazit detail
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