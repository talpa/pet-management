import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  CardMedia,
  FormControlLabel,
  Checkbox,
  Pagination,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Pets as PetsIcon,
  PhotoCamera as PhotoCameraIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import ImageUpload from './ImageUpload';
import SeoUrlManager from './SeoUrlManager';
import QrCodeGenerator from './QrCodeGenerator';
import ViewModeToggle from './ViewModeToggle';
import TagInput, { Tag } from './TagInput';

interface AnimalSpecies {
  id: number;
  name: string;
  category: string;
  properties: SpeciesProperty[];
}

interface SpeciesProperty {
  id: number;
  speciesId?: number;
  // Frontend format (expected by form)
  name?: string;
  type?: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT';
  required?: boolean;
  // Backend format (from API)
  propertyName?: string;
  propertyType?: string;
  isRequired?: boolean;
  propertyUnit?: string;
  // Common fields
  defaultValue?: string;
  selectOptions?: string[];
  validationRules?: any;
  displayOrder?: number;
  created_at?: string;
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

interface Animal {
  id: number;
  name: string;
  species: AnimalSpecies;
  ownerId: number;
  ownerName: string;
  birthDate?: string;
  description?: string;
  seoUrl?: string;
  properties: AnimalProperty[];
  images: AnimalImage[];
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  speciesId: number | '';
  ownerId: number | '';
  birthDate: string;
  description: string;
  seoUrl: string;
  properties: { [key: number]: string };
  tags: Tag[];
}

interface AnimalManagementProps {
  editMode?: 'list' | 'create' | 'edit';
}

const AnimalManagement: React.FC<AnimalManagementProps> = ({ editMode = 'list' }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  
  // Helper function to generate SEO URL from name
  const generateSeoUrl = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // Handle Czech specific characters first
      .replace(/ř/g, 'r')
      .replace(/č/g, 'c')
      .replace(/ž/g, 'z')
      .replace(/š/g, 's')
      .replace(/ň/g, 'n')
      .replace(/ť/g, 't')
      .replace(/ď/g, 'd')
      .replace(/ě/g, 'e')
      .replace(/ů/g, 'u')
      .replace(/ý/g, 'y')
      .replace(/á/g, 'a')
      .replace(/í/g, 'i')
      .replace(/é/g, 'e')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      // General diacritics removal
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Remove non-alphanumeric chars except spaces and hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '');
  };
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [species, setSpecies] = useState<AnimalSpecies[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination and search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('animalViewMode') as 'grid' | 'list') || 'grid';
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    speciesId: '',
    ownerId: '',
    birthDate: '',
    description: '',
    seoUrl: '',
    properties: {},
    tags: [],
  });

  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [seoUrlValid, setSeoUrlValid] = useState(false);

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    localStorage.setItem('animalViewMode', newMode);
  };

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('animalViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    loadAnimals();
    loadSpecies();
    loadCurrentUser();
  }, [page, searchTerm, selectedSpeciesFilter]);

  // Load users only after current user is loaded and if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  // Handle edit mode from routing
  useEffect(() => {
    if (editMode === 'create') {
      setOpenDialog(true);
    } else if (editMode === 'edit' && id) {
      // Load animal for editing
      const animalId = parseInt(id, 10);
      if (!isNaN(animalId)) {
        // Try to load it directly to avoid dependency on animals array changes
        loadAnimalForEdit(animalId);
      }
    }
  }, [editMode, id]); // Removed animals dependency to prevent re-triggers

  const loadAnimalForEdit = async (animalId: number) => {
    try {
      console.log('loadAnimalForEdit called with ID:', animalId);
      console.log('Current species count:', species.length);
      
      // Ensure species are loaded first
      if (species.length === 0) {
        console.log('Loading species first...');
        await loadSpecies();
      }
      
      console.log('Loading animal data...');
      const response = await apiClient.get(`/animals/${animalId}`);
      const animal = response.data.data; // API returns data in .data.data structure
      console.log('Animal loaded:', animal);
      
      handleOpenEdit(animal);
    } catch (error) {
      console.error('Failed to load animal for editing:', error);
      navigate('/my-animals');
    }
  };

  useEffect(() => {
    if (formData.speciesId) {
      const speciesItem = species.find(s => s.id === formData.speciesId);
      setSelectedSpecies(speciesItem || null);
      
      // Initialize properties with default values
      if (speciesItem && speciesItem.properties) {
        const initialProperties: { [key: number]: string } = {};
        speciesItem.properties.forEach(prop => {
          initialProperties[prop.id] = prop.defaultValue || '';
        });
        
        // Only update properties if not editing (to preserve edit values)
        if (!editingAnimal) {
          setFormData(prev => ({ ...prev, properties: initialProperties }));
        }
      } else {
        // Clear properties if no species selected
        if (!editingAnimal) {
          setFormData(prev => ({ ...prev, properties: {} }));
        }
      }
    } else {
      setSelectedSpecies(null);
      if (!editingAnimal) {
        setFormData(prev => ({ ...prev, properties: {} }));
      }
    }
  }, [formData.speciesId, species, editingAnimal]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Increased limit to get more animals for filtering
        ...(searchTerm && { search: searchTerm }),
        ...(selectedSpeciesFilter && { speciesId: selectedSpeciesFilter.toString() }),
      });
      
      console.log('Loading animals with params:', params.toString());
      const response = await apiClient.get(`/animals?${params}`);
      let allAnimals = response.data.data;
      
      // AnimalManagement je používána jen pro adminské rozhraní (requireAdmin={true})
      // Takže administrátoři vidí všechna zvířata bez filtrování
      console.log(`Loaded ${allAnimals.length} animals for admin interface`);
      
      setAnimals(allAnimals);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t('animals.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadSpecies = async () => {
    try {
      const response = await apiClient.get('/animal/species');
      setSpecies(response.data.data);
    } catch (err: any) {
      console.error('Failed to load species:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        console.log('User does not have permission to load users list - not an admin');
        setUsers([]); // Set empty array instead of error
      } else {
        console.error('Failed to load users:', err);
      }
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/user');
      setCurrentUser(response.data.data);
    } catch (err: any) {
      console.error('Failed to load current user:', err);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      speciesId: '',
      ownerId: currentUser?.id || '',
      birthDate: '',
      description: '',
      seoUrl: '',
      properties: {},
      tags: [],
    });
    setEditingAnimal(null);
    setSelectedSpecies(null);
    setActiveTab(0);
    setOpenDialog(true);
  };

  const handleOpenEdit = (animal: Animal) => {
    console.log('handleOpenEdit called with animal:', animal);
    console.log('Current species loaded:', species.length);
    console.log('Current user:', currentUser);
    
    // Check if animal has species data
    if (!animal.species || !animal.species.id) {
      console.error('Animal species data is missing:', animal);
      setError('Chyba: Informace o druhu zvířete nejsou dostupné');
      return;
    }
    
    // Check if user can edit this animal (own animal or admin)
    if (currentUser && currentUser.role !== 'admin' && animal.ownerId !== currentUser.id) {
      setError('Nemáte oprávnění k editaci tohoto zvířete. Můžete editovat pouze svá vlastní zvířata.');
      return;
    }
    
    // Find the full species data from loaded species (with properties)
    const fullSpecies = species.find(s => s.id === animal.species.id);
    console.log('Found fullSpecies:', fullSpecies);
    
    const properties: { [key: number]: string } = {};
    
    // Load species properties with current values or defaults
    if (fullSpecies && fullSpecies.properties) {
      fullSpecies.properties.forEach(speciesProperty => {
        // Find if animal has a value for this property
        const animalProperty = animal.properties.find(
          prop => prop.propertyName === speciesProperty.propertyName
        );
        
        // Use animal's value if exists, otherwise use species default
        properties[speciesProperty.id] = animalProperty 
          ? animalProperty.propertyValue 
          : (speciesProperty.defaultValue || '');
      });
    }
    
    setFormData({
      name: animal.name,
      speciesId: animal.species.id,
      ownerId: animal.ownerId || '',
      birthDate: animal.birthDate || '',
      description: animal.description || '',
      seoUrl: animal.seoUrl || '',
      properties,
      tags: animal.tags || [],
    });
    
    // Use fullSpecies (with properties) instead of animal.species
    setSelectedSpecies(fullSpecies || animal.species);
    
    setEditingAnimal(animal);
    setActiveTab(0);
    setOpenDialog(true);
    console.log('Dialog should be open now');
  };

  const handleCloseDialog = () => {
    console.log('handleCloseDialog called');
    setOpenDialog(false);
    setEditingAnimal(null);
    setSelectedSpecies(null);
    setActiveTab(0);
    setFormData({
      name: '',
      speciesId: '',
      birthDate: '',
      description: '',
      seoUrl: '',
      ownerId: '',
      properties: {},
      tags: [],
    });
    
    // Navigate back if in edit mode
    if (editMode === 'create' || editMode === 'edit') {
      console.log('Navigating back to /my-animals due to edit mode');
      navigate('/my-animals');
    }
  };

  const handleSubmit = async () => {
    try {
      // For non-admin users, ensure ownerId is set to current user when editing
      let finalOwnerId = formData.ownerId;
      if (currentUser && currentUser.role !== 'admin') {
        finalOwnerId = currentUser.id;
      }
      
      const payload = {
        name: formData.name,
        speciesId: formData.speciesId,
        ownerId: finalOwnerId,
        birthDate: formData.birthDate || null,
        description: formData.description || null,
        seoUrl: formData.seoUrl || null,
        properties: Object.entries(formData.properties).map(([propertyId, value]) => ({
          speciesPropertyId: parseInt(propertyId),
          value,
        })),
        tags: formData.tags.map(tag => tag.id), // Send only tag IDs
      };

      console.log('Submitting payload:', payload);

      if (editingAnimal) {
        await apiClient.put(`/animals/${editingAnimal.id}`, payload);
        setSuccess(t('animals.messages.updateSuccess'));
        handleCloseDialog();
        loadAnimals();
      } else {
        const response = await apiClient.post('/animals', payload);
        setSuccess(t('animals.messages.createSuccess'));
        
        // In edit mode, navigate back to my animals after creation
        if (editMode === 'create') {
          handleCloseDialog();
          loadAnimals();
        } else {
          // In normal mode, automatically open for editing to add images
          if (response.data.success && response.data.data) {
            const createdAnimal = response.data.data;
            // Load the created animal for editing to add images
            loadAnimals(); // Refresh the list first
            setTimeout(() => {
              handleOpenEdit(createdAnimal);
              setActiveTab(2); // Switch to images tab
            }, 500);
          } else {
            handleCloseDialog();
          }
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      
      if (err.response?.status === 403) {
        setError('Nemáte oprávnění k editaci tohoto zvířete. Můžete editovat pouze svá vlastní zvířata.');
      } else if (err.response?.status === 404) {
        setError('Zvíře nebylo nalezeno.');
      } else {
        setError(err.response?.data?.message || t('animals.errors.saveFailed'));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/animals/${id}`);
      setSuccess(t('animals.messages.deleteSuccess'));
      setDeleteConfirmId(null);
      loadAnimals();
    } catch (err: any) {
      setError(err.response?.data?.message || t('animals.errors.deleteFailed'));
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    loadAnimals();
  };

  const formatPropertyValue = (property: AnimalProperty): string => {
    // Since we don't have type info directly in AnimalProperty,
    // we'll just return the value as string for now
    return property.propertyValue || '';
  };

  const renderPropertyInput = (property: SpeciesProperty) => {
    const value = formData.properties[property.id] || '';
    
    // Map backend format to frontend format
    const propertyName = property.propertyName || property.name || '';
    const propertyType = property.propertyType || property.type;
    const isRequired = property.isRequired !== undefined ? property.isRequired : property.required;
    
    // Convert backend propertyType to frontend type format
    let frontendType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' = 'TEXT';
    if (propertyType) {
      switch (propertyType.toLowerCase()) {
        case 'number':
          frontendType = 'NUMBER';
          break;
        case 'boolean':
          frontendType = 'BOOLEAN';
          break;
        case 'date':
          frontendType = 'DATE';
          break;
        case 'select':
          frontendType = 'SELECT';
          break;
        case 'text':
        default:
          frontendType = 'TEXT';
          break;
      }
    }
    
    switch (frontendType) {
      case 'BOOLEAN':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value === 'true'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  properties: {
                    ...prev.properties,
                    [property.id]: e.target.checked.toString(),
                  },
                }))}
              />
            }
            label={propertyName}
          />
        );
      
      case 'SELECT':
        return (
          <FormControl fullWidth>
            <InputLabel>{propertyName}</InputLabel>
            <Select
              value={value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                properties: {
                  ...prev.properties,
                  [property.id]: e.target.value,
                },
              }))}
              label={propertyName}
              required={isRequired}
            >
              {property.selectOptions?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'NUMBER':
        return (
          <TextField
            label={propertyName}
            type="number"
            fullWidth
            value={value}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              properties: {
                ...prev.properties,
                [property.id]: e.target.value,
              },
            }))}
            required={isRequired}
          />
        );
      
      case 'DATE':
        return (
          <TextField
            label={propertyName}
            type="date"
            fullWidth
            value={value}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              properties: {
                ...prev.properties,
                [property.id]: e.target.value,
              },
            }))}
            InputLabelProps={{ shrink: true }}
            required={isRequired}
          />
        );
      
      default: // TEXT
        return (
          <TextField
            label={propertyName}
            fullWidth
            value={value}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              properties: {
                ...prev.properties,
                [property.id]: e.target.value,
              },
            }))}
            required={isRequired}
          />
        );
    }
  };

  if (loading && animals.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Hide header and lists in edit modes */}
      {editMode === 'list' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {t('animals.title')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={loading}
            >
              {t('animals.addNew')}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
        </>
      )}

      {/* Show error/success in edit modes too */}
      {editMode !== 'list' && (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
        </>
      )}

      {/* View Mode Toggle and Search/Filter - Only show in list mode */}
      {editMode === 'list' && (
        <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder={t('animals.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('animals.filterBySpecies')}</InputLabel>
              <Select
                value={selectedSpeciesFilter}
                onChange={(e) => {
                  setSelectedSpeciesFilter(e.target.value as number | '');
                  setPage(1);
                }}
                label={t('animals.filterBySpecies')}
              >
                <MenuItem value="">{t('animals.allSpecies')}</MenuItem>
                {species.map((speciesItem) => (
                  <MenuItem key={speciesItem.id} value={speciesItem.id}>
                    {speciesItem.name} ({speciesItem.category})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ViewModeToggle 
              viewMode={viewMode} 
              onModeChange={handleViewModeChange}
              gridTooltip="Kaskádový pohled"
              listTooltip="Seznamový pohled"
            />
          </Grid>
        </Grid>
      </Paper>
      )}

      {/* Content based on view mode - Only show in list mode */}
      {editMode === 'list' && (
        <>
          {/* Content based on view mode */}
          {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {animals.map((animal) => (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {animal.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={animal.images.find(img => img.isPrimary)?.url || animal.images[0].url}
                  alt={animal.name}
                />
              )}
              
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PetsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {animal.name}
                  </Typography>
                </Box>
                
                <Chip 
                  label={`${animal.species.name} (${animal.species.category})`}
                  size="small" 
                  sx={{ mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('animals.owner')}: {animal.ownerName}
                </Typography>
                
                {animal.birthDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('animals.birthDate')}: {(() => {
                      const date = new Date(animal.birthDate);
                      return isNaN(date.getTime()) ? 'Neplatné datum' : date.toLocaleDateString('cs-CZ');
                    })()}
                  </Typography>
                )}
                
                {animal.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {animal.description}
                  </Typography>
                )}
                
                {animal.tags && animal.tags.length > 0 && (
                  <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {animal.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        sx={{
                          backgroundColor: tag.color || '#e0e0e0',
                          color: tag.color ? getContrastColor(tag.color) : '#000000',
                          fontSize: '0.7rem',
                          height: '20px',
                        }}
                      />
                    ))}
                    {animal.tags.length > 3 && (
                      <Chip
                        label={`+${animal.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {t('animals.propertiesCount', { count: animal.properties.length })}
                </Typography>
              </CardContent>
              
              <CardActions>
                <IconButton onClick={() => setViewingAnimal(animal)}>
                  <ViewIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenEdit(animal)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setDeleteConfirmId(animal.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Obrázek</TableCell>
                <TableCell>Název</TableCell>
                <TableCell>Druh</TableCell>
                <TableCell>Majitel</TableCell>
                <TableCell>Datum narození</TableCell>
                <TableCell>Akce</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id} hover>
                  <TableCell>
                    {animal.images.length > 0 ? (
                      <Avatar
                        src={animal.images.find(img => img.isPrimary)?.thumbnailUrl || animal.images[0].thumbnailUrl}
                        alt={animal.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <PetsIcon />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{animal.name}</Typography>
                      {animal.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {animal.description.length > 50 
                            ? `${animal.description.substring(0, 50)}...` 
                            : animal.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${animal.species.name}`}
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{animal.ownerName}</Typography>
                  </TableCell>
                  <TableCell>
                    {animal.birthDate ? (
                      (() => {
                        const date = new Date(animal.birthDate);
                        return isNaN(date.getTime()) ? 'Neplatné datum' : date.toLocaleDateString('cs-CZ');
                      })()
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Zobrazit">
                        <IconButton size="small" onClick={() => setViewingAnimal(animal)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Upravit">
                        <IconButton size="small" onClick={() => handleOpenEdit(animal)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Smazat">
                        <IconButton size="small" onClick={() => setDeleteConfirmId(animal.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
      </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingAnimal 
            ? t('animals.editTitle') 
            : t('animals.createTitle')
          }
          {!editingAnimal && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Po vytvoření můžete přidat fotografie a vygenerovat QR kód
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
              <Tab label={t('animals.tabs.basic')} />
              <Tab label={t('animals.tabs.seo')} />
              {editingAnimal && <Tab label={t('animals.tabs.images')} />}
              {editingAnimal && <Tab label={t('animals.tabs.qrCode')} />}
            </Tabs>

            {/* Basic Information Tab */}
            {activeTab === 0 && (
              <Box>
                <TextField
                  autoFocus
                  label={t('animals.form.name')}
                  fullWidth
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      name,
                      // Auto-generate SEO URL only if it's empty or matches the previous name's SEO URL
                      seoUrl: !prev.seoUrl || prev.seoUrl === generateSeoUrl(prev.name) 
                        ? generateSeoUrl(name) 
                        : prev.seoUrl
                    }));
                  }}
                  sx={{ mb: 2 }}
                  required
                />
                
                {/* Helper text for auto SEO URL generation */}
                {!editingAnimal && formData.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    💡 SEO URL se automaticky vytvoří z názvu: <strong>{generateSeoUrl(formData.name)}</strong>
                  </Typography>
                )}
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>{t('animals.form.species')}</InputLabel>
                  <Select
                    value={formData.speciesId}
                    onChange={(e) => setFormData(prev => ({ ...prev, speciesId: e.target.value as number | '' }))}
                    label={t('animals.form.species')}
                    required
                  >
                    {species.map((speciesItem) => (
                      <MenuItem key={speciesItem.id} value={speciesItem.id}>
                        {speciesItem.name} ({speciesItem.category})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Owner Selection - Only for Admin */}
                {currentUser && currentUser.role === 'admin' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Majitel</InputLabel>
                    <Select
                      value={formData.ownerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value as number | '' }))}
                      label="Majitel"
                      required
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <TextField
                  label={t('animals.form.birthDate')}
                  type="date"
                  fullWidth
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label={t('animals.form.description')}
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mb: 3 }}
                />
                
                <TagInput
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  placeholder="Vyberte nebo zadejte tagy pro lepší kategorizaci..."
                  helperText="Tagy pomáhají při vyhledávání a filtrování zvířat"
                />
                
                {selectedSpecies && selectedSpecies.properties && selectedSpecies.properties.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('animals.form.speciesProperties')}
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedSpecies?.properties?.map((property) => (
                        <Grid item xs={12} sm={6} key={property.id}>
                          {renderPropertyInput(property)}
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
            )}

            {/* SEO URL Tab */}
            {activeTab === 1 && (
              <Box>
                <SeoUrlManager
                  animalId={editingAnimal?.id}
                  initialValue={formData.seoUrl}
                  animalName={formData.name}
                  onSeoUrlChange={(seoUrl, isValid) => {
                    setFormData(prev => ({ ...prev, seoUrl }));
                    setSeoUrlValid(isValid);
                  }}
                />
              </Box>
            )}

            {/* Images Tab */}
            {activeTab === 2 && editingAnimal && (
              <Box>
                <ImageUpload
                  animalId={editingAnimal.id}
                  existingImages={editingAnimal.images?.map(img => ({
                    id: img.id,
                    url: img.url,
                    thumbnailUrl: img.thumbnailUrl,
                    originalName: img.originalName,
                    isPrimary: img.isPrimary,
                  }))}
                  onImagesUpdate={(images) => {
                    // Update the editing animal with new images
                    if (editingAnimal) {
                      setEditingAnimal({
                        ...editingAnimal,
                        images: images.filter(img => img.id).map(img => ({
                          id: img.id!,
                          filename: img.originalName,
                          originalName: img.originalName,
                          url: img.url,
                          thumbnailUrl: img.thumbnailUrl || img.url,
                          isPrimary: img.isPrimary,
                        }))
                      });
                    }
                  }}
                />
              </Box>
            )}

            {/* QR Code Tab */}
            {activeTab === 3 && editingAnimal && (
              <Box>
                <QrCodeGenerator
                  animalId={editingAnimal.id}
                  animalName={editingAnimal.name}
                  seoUrl={formData.seoUrl}
                  onSeoUrlRequired={() => setActiveTab(1)}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.speciesId}
          >
            {editingAnimal ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog 
        open={!!viewingAnimal} 
        onClose={() => setViewingAnimal(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{viewingAnimal?.name}</DialogTitle>
        <DialogContent>
          {viewingAnimal && (
            <Box>
              {viewingAnimal.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={1}>
                    {viewingAnimal.images?.map((image) => (
                      <Grid item xs={6} sm={4} md={3} key={image.id}>
                        <Box
                          component="img"
                          src={image.url}
                          alt={image.originalName}
                          sx={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'cover', 
                            borderRadius: '8px' 
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{t('animals.form.species')}:</strong> {viewingAnimal.species.name} ({viewingAnimal.species.category})
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{t('animals.owner')}:</strong> {viewingAnimal.ownerName}
              </Typography>
              
              {viewingAnimal.birthDate && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>{t('animals.birthDate')}:</strong> {new Date(viewingAnimal.birthDate).toLocaleDateString()}
                </Typography>
              )}
              
              {viewingAnimal.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>{t('animals.form.description')}:</strong> {viewingAnimal.description}
                </Typography>
              )}
              
              {viewingAnimal.properties.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('animals.form.speciesProperties')}:
                  </Typography>
                  
                  {viewingAnimal.properties?.map((property) => (
                    <Paper key={property.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{property.propertyName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatPropertyValue(property)}
                      </Typography>
                    </Paper>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingAnimal(null)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('animals.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('animals.deleteConfirmation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} 
            color="error"
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnimalManagement;