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
  Fab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';
import ViewModeToggle from './ViewModeToggle';

interface SpeciesProperty {
  id?: number;
  speciesId?: number;
  // Frontend format (for form)
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

interface AnimalSpecies {
  id: number;
  name: string;
  category: string;
  description?: string;
  properties: SpeciesProperty[];
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  properties: Omit<SpeciesProperty, 'id'>[];
}

const AnimalSpeciesManagement: React.FC = () => {
  const { t } = useTranslation();
  const [species, setSpecies] = useState<AnimalSpecies[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('speciesViewMode') as 'grid' | 'list') || 'grid';
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<AnimalSpecies | null>(null);
  const [viewingSpecies, setViewingSpecies] = useState<AnimalSpecies | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    properties: [],
  });

  const propertyTypes = [
    { value: 'TEXT', label: t('animalSpecies.propertyTypes.text') },
    { value: 'NUMBER', label: t('animalSpecies.propertyTypes.number') },
    { value: 'BOOLEAN', label: t('animalSpecies.propertyTypes.boolean') },
    { value: 'DATE', label: t('animalSpecies.propertyTypes.date') },
    { value: 'SELECT', label: t('animalSpecies.propertyTypes.select') },
  ];

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    localStorage.setItem('speciesViewMode', newMode);
  };

  useEffect(() => {
    loadSpecies();
    loadCategories();
  }, []);

  const loadSpecies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/animal/species');
      setSpecies(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t('animalSpecies.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/animal/species/categories');
      setCategories(response.data.data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      properties: [],
    });
    setEditingSpecies(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (speciesItem: AnimalSpecies) => {
    setFormData({
      name: speciesItem.name,
      category: speciesItem.category,
      description: speciesItem.description || '',
      properties: speciesItem.properties.map(p => {
        // Convert backend propertyType to frontend type format
        let frontendType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' = 'TEXT';
        const backendType = p.propertyType || p.type;
        
        if (backendType) {
          switch (backendType.toLowerCase()) {
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
        
        return {
          name: p.propertyName || p.name,
          type: frontendType,
          required: p.isRequired !== undefined ? p.isRequired : p.required,
          defaultValue: p.defaultValue,
          selectOptions: p.selectOptions,
        };
      }),
    });
    setEditingSpecies(speciesItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSpecies(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      properties: [],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Convert frontend format to backend format
      const submitData = {
        ...formData,
        properties: formData.properties.map((prop, index) => ({
          propertyName: prop.name,
          propertyType: prop.type?.toLowerCase() || 'text', // Convert to lowercase for backend
          isRequired: prop.required,
          defaultValue: prop.defaultValue,
          selectOptions: prop.selectOptions,
          displayOrder: index,
        })),
      };
      
      if (editingSpecies) {
        await apiClient.put(`/animal/species/${editingSpecies.id}`, submitData);
        setSuccess(t('animalSpecies.messages.updateSuccess'));
      } else {
        await apiClient.post('/animal/species', submitData);
        setSuccess(t('animalSpecies.messages.createSuccess'));
      }
      
      handleCloseDialog();
      await loadSpecies();
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || t('animalSpecies.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await apiClient.delete(`/animal/species/${id}`);
      setSuccess(t('animalSpecies.messages.deleteSuccess'));
      setDeleteConfirmId(null);
      await loadSpecies();
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || t('animalSpecies.errors.deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  const addProperty = () => {
    setFormData(prev => ({
      ...prev,
      properties: [
        ...prev.properties,
        {
          name: '',
          type: 'TEXT',
          required: false,
          defaultValue: '',
          selectOptions: [],
        },
      ],
    }));
  };

  const removeProperty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  };

  const updateProperty = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      ),
    }));
  };

  if (loading && species.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1">
              {t('animalSpecies.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ViewModeToggle 
              viewMode={viewMode} 
              onModeChange={handleViewModeChange}
              gridTooltip="Kaskádový pohled"
              listTooltip="Seznamový pohled"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={loading}
            >
              {t('animalSpecies.addNew')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

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

      {/* Content based on view mode */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {species.map((speciesItem) => (
            <Grid item xs={12} sm={6} md={4} key={speciesItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {speciesItem.name}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={speciesItem.category} 
                    size="small" 
                    sx={{ mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                  
                  {speciesItem.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {speciesItem.description}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    {t('animalSpecies.propertiesCount', { count: speciesItem.properties.length })}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Tooltip title={t('common.view')}>
                    <IconButton onClick={() => setViewingSpecies(speciesItem)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.edit')}>
                    <IconButton onClick={() => handleOpenEdit(speciesItem)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.delete')}>
                    <IconButton onClick={() => setDeleteConfirmId(speciesItem.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
                <TableCell>Název</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Popis</TableCell>
                <TableCell>Počet vlastností</TableCell>
                <TableCell>Vytvořeno</TableCell>
                <TableCell>Akce</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {species.map((speciesItem) => (
                <TableRow key={speciesItem.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                        <CategoryIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2">
                        {speciesItem.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={speciesItem.category} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {speciesItem.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {speciesItem.properties.length}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(speciesItem.createdAt).toLocaleDateString('cs-CZ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t('common.view')}>
                      <IconButton 
                        size="small"
                        onClick={() => setViewingSpecies(speciesItem)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.edit')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenEdit(speciesItem)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton 
                        size="small"
                        onClick={() => setDeleteConfirmId(speciesItem.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSpecies 
            ? t('animalSpecies.editTitle') 
            : t('animalSpecies.createTitle')
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label={t('animalSpecies.form.name')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('animalSpecies.form.category')}</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                label={t('animalSpecies.form.category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem value="new">{t('animalSpecies.form.newCategory')}</MenuItem>
              </Select>
            </FormControl>
            
            {formData.category === 'new' && (
              <TextField
                label={t('animalSpecies.form.newCategoryName')}
                fullWidth
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                sx={{ mb: 2 }}
              />
            )}
            
            <TextField
              label={t('animalSpecies.form.description')}
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('animalSpecies.form.properties')}
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addProperty}>
                {t('animalSpecies.form.addProperty')}
              </Button>
            </Box>
            
            {formData.properties.map((property, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label={t('animalSpecies.form.propertyName')}
                      fullWidth
                      size="small"
                      value={property.name}
                      onChange={(e) => updateProperty(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('animalSpecies.form.propertyType')}</InputLabel>
                      <Select
                        value={property.type}
                        onChange={(e) => updateProperty(index, 'type', e.target.value)}
                        label={t('animalSpecies.form.propertyType')}
                      >
                        {propertyTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label={t('animalSpecies.form.defaultValue')}
                      fullWidth
                      size="small"
                      value={property.defaultValue || ''}
                      onChange={(e) => updateProperty(index, 'defaultValue', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={property.required}
                          onChange={(e) => updateProperty(index, 'required', e.target.checked)}
                        />
                        {t('animalSpecies.form.required')}
                      </label>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton onClick={() => removeProperty(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  {property.type === 'SELECT' && (
                    <Grid item xs={12}>
                      <TextField
                        label={t('animalSpecies.form.selectOptions')}
                        fullWidth
                        size="small"
                        placeholder={t('animalSpecies.form.selectOptionsPlaceholder')}
                        value={property.selectOptions?.join(', ') || ''}
                        onChange={(e) => updateProperty(index, 'selectOptions', 
                          e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        )}
                        helperText={t('animalSpecies.form.selectOptionsHelp')}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.category}
          >
            {editingSpecies ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog 
        open={!!viewingSpecies} 
        onClose={() => setViewingSpecies(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{viewingSpecies?.name}</DialogTitle>
        <DialogContent>
          {viewingSpecies && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{t('animalSpecies.form.category')}:</strong> {viewingSpecies.category}
              </Typography>
              
              {viewingSpecies.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>{t('animalSpecies.form.description')}:</strong> {viewingSpecies.description}
                </Typography>
              )}
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('animalSpecies.form.properties')}:
              </Typography>
              
              {viewingSpecies.properties.length > 0 ? (
                viewingSpecies.properties.map((property, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="subtitle2">{property.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('animalSpecies.form.propertyType')}: {property.type}
                      {property.required && ` • ${t('animalSpecies.form.required')}`}
                      {property.defaultValue && ` • ${t('animalSpecies.form.defaultValue')}: ${property.defaultValue}`}
                    </Typography>
                    {property.selectOptions && property.selectOptions.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {t('animalSpecies.form.selectOptions')}: {property.selectOptions.join(', ')}
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('animalSpecies.noProperties')}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingSpecies(null)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('animalSpecies.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('animalSpecies.deleteConfirmation')}</Typography>
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

export default AnimalSpeciesManagement;