import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Avatar,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import PublicLayout from './PublicLayout';
import QRCodeDisplay from './QRCodeDisplay';

interface AnimalSpecies {
  id: number;
  name: string;
  scientificName?: string;
  description?: string;
  category?: string;
}

interface AnimalProperty {
  id: number;
  animalId: number;
  propertyName: string;
  propertyValue: string;
  measuredAt?: Date;
  notes?: string;
}

interface AnimalImage {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Animal {
  id: number;
  name: string;
  speciesId: number;
  ownerId: number;
  birthDate?: string;
  gender?: string;
  description?: string;
  seoUrl?: string;
  isActive: boolean;
  createdBy: number;
  created_at: string;
  updated_at: string;
  species: AnimalSpecies;
  owner: User;
  creator: User;
  properties: AnimalProperty[];
  images: AnimalImage[];
}

const AnimalDetail: React.FC = () => {
  const { seoUrl } = useParams<{ seoUrl: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimal = async () => {
      if (!seoUrl) {
        setError('Invalid SEO URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/animals/by-seo/${seoUrl}`);
        setAnimal(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error('Error loading animal:', err);
        if (err.response?.status === 404) {
          setError(t('animalDetail.errors.notFound'));
        } else {
          setError(err.response?.data?.message || t('animalDetail.errors.loadingError'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [seoUrl]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
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

  if (loading) {
    return (
      <PublicLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PublicLayout>
    );
  }

  if (error || !animal) {
    return (
      <PublicLayout title={t('animalDetail.title.notFound')}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || t('animalDetail.errors.animalNotFound')}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="contained"
        >
          {t('common.backToHome')}
        </Button>
      </PublicLayout>
    );
  }

  const primaryImage = animal.images?.find(img => img.isPrimary) || animal.images?.[0];

  return (
    <PublicLayout title={animal.name}>
      {/* Species and Category Info */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            icon={<PetsIcon />}
            label={animal.species.name}
            color="primary"
            size="medium"
          />
          {animal.species.category && (
            <Chip
              label={animal.species.category}
              variant="outlined"
              size="medium"
            />
          )}
        </Box>
        
        {animal.species.scientificName && (
          <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {animal.species.scientificName}
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Image */}
        {primaryImage && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={primaryImage.url}
                alt={animal.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>
        )}

        {/* Basic Info */}
        <Grid item xs={12} md={primaryImage ? 6 : 12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('animalDetail.basicInfo')}
            </Typography>
            
            <Grid container spacing={2}>
              {animal.birthDate && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('animalDetail.fields.birthDate')}
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(animal.birthDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({calculateAge(animal.birthDate)})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('animalDetail.fields.owner')}
                    </Typography>
                    <Typography variant="body1">
                      {animal.owner.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {animal.species.scientificName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('animalDetail.fields.scientificName')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {animal.species.scientificName}
                  </Typography>
                </Grid>
              )}

              {animal.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('animalDetail.fields.description')}
                  </Typography>
                  <Typography variant="body1">
                    {animal.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Properties */}
        {animal.properties && animal.properties.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {t('animalDetail.properties')}
              </Typography>
              <Grid container spacing={2}>
                {animal.properties.map((property) => (
                  <Grid item xs={12} sm={6} md={4} key={property.id}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t(`animalDetail.propertyNames.${property.propertyName}`, property.propertyName)}
                      </Typography>
                      <Typography variant="body1">
                        {property.propertyValue || t('animalDetail.notSpecified')}
                      </Typography>
                      {property.measuredAt && (
                        <Typography variant="caption" color="text.secondary">
                          {t('animalDetail.measuredAt')}: {formatDate(property.measuredAt.toString())}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* QR Code Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              📱 {t('animalDetail.qrCode.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('animalDetail.qrCode.description')}
            </Typography>
            <QRCodeDisplay animalId={animal.id} seoUrl={animal.seoUrl!} />
          </Paper>
        </Grid>

        {/* Additional Images */}
        {animal.images && animal.images.length > 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {t('animalDetail.additionalPhotos')}
              </Typography>
              <Grid container spacing={2}>
                {animal.images
                  .filter(img => !img.isPrimary)
                  .map((image) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image.url}
                          alt={`${animal.name} - ${image.originalName}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </PublicLayout>
  );
};

export default AnimalDetail;