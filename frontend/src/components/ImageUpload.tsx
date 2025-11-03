import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardActions,
  LinearProgress,
  Alert,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Image as ImageIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';

interface ImageFile {
  id?: number;
  file?: File;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  isPrimary: boolean;
  size?: number;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  animalId: number;
  existingImages?: ImageFile[];
  onImagesUpdate?: (images: ImageFile[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  animalId,
  existingImages = [],
  onImagesUpdate,
  maxImages = 10,
  maxFileSize = 10,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageFile[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [viewingImage, setViewingImage] = useState<ImageFile | null>(null);

  const updateImages = useCallback((newImages: ImageFile[]) => {
    setImages(newImages);
    onImagesUpdate?.(newImages);
  }, [onImagesUpdate]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Validate file count
    if (images.length + newFiles.length > maxImages) {
      setError(t('imageUpload.errors.tooManyFiles', { max: maxImages }));
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        errors.push(t('imageUpload.errors.invalidType', { name: file.name }));
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(t('imageUpload.errors.fileTooLarge', { name: file.name, max: maxFileSize }));
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (validFiles.length === 0) return;

    // Add files to preview
    const newImages: ImageFile[] = validFiles.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      originalName: file.name,
      isPrimary: images.length === 0 && index === 0, // First image of empty list is primary
      size: file.size,
      uploading: false,
    }));

    updateImages([...images, ...newImages]);
    setError(null);
  }, [images, maxImages, maxFileSize, t, updateImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const uploadImages = async () => {
    const filesToUpload = images.filter(img => img.file && !img.id);
    if (filesToUpload.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      filesToUpload.forEach((img, index) => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });

      // Update uploading status for preview
      const updatedImages = images.map(img => 
        img.file && !img.id ? { ...img, uploading: true } : img
      );
      updateImages(updatedImages);

      const response = await apiClient.post(`/animals/${animalId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Replace local files with server response
        const uploadedImages = response.data.data;
        const finalImages = images
          .filter(img => img.id) // Keep existing images
          .concat(uploadedImages.map((uploaded: any) => ({
            id: uploaded.id,
            url: uploaded.url,
            thumbnailUrl: uploaded.thumbnailUrl,
            originalName: uploaded.originalName,
            isPrimary: uploaded.isPrimary,
          })));

        updateImages(finalImages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('imageUpload.errors.uploadFailed'));
      
      // Remove uploading status on error
      const resetImages = images.map(img => ({ ...img, uploading: false }));
      updateImages(resetImages);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    
    if (image.id) {
      // Delete from server
      try {
        await apiClient.delete(`/animals/${animalId}/images/${image.id}`);
      } catch (err: any) {
        setError(err.response?.data?.message || t('imageUpload.errors.deleteFailed'));
        return;
      }
    }

    // Remove from local state
    if (image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }

    const newImages = images.filter((_, i) => i !== index);
    
    // If removed image was primary, make first image primary
    if (image.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
      if (newImages[0].id) {
        try {
          await apiClient.put(`/animals/${animalId}/images/${newImages[0].id}/primary`);
        } catch (err) {
          console.error('Failed to set new primary image:', err);
        }
      }
    }

    updateImages(newImages);
  };

  const setPrimaryImage = async (index: number) => {
    const image = images[index];
    
    if (!image.id) {
      setError(t('imageUpload.errors.uploadFirst'));
      return;
    }

    try {
      await apiClient.put(`/animals/${animalId}/images/${image.id}/primary`);
      
      const newImages = images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      
      updateImages(newImages);
    } catch (err: any) {
      setError(err.response?.data?.message || t('imageUpload.errors.setPrimaryFailed'));
    }
  };

  const hasUnsavedImages = images.some(img => img.file && !img.id);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('imageUpload.title')}
      </Typography>

      {/* Instructions */}
      {images.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nahrajte obrázky svého domácího mazlíčka. Podporované formáty: JPEG, PNG, GIF, WebP. Maximální velikost: {maxFileSize}MB.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          bgcolor: dragOver ? 'primary.50' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Box sx={{ textAlign: 'center' }}>
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            {t('imageUpload.dropZone.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('imageUpload.dropZone.subtitle', { max: maxImages, size: maxFileSize })}
          </Typography>
          <Button variant="outlined" startIcon={<ImageIcon />}>
            {t('imageUpload.selectFiles')}
          </Button>
        </Box>
      </Paper>

      <Box 
        component="input"
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        aria-label={t('imageUpload.selectFiles')}
        sx={{ display: 'none' }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files)}
      />

      {/* Images Grid */}
      {images.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              {t('imageUpload.imagesCount', { count: images.length, max: maxImages })}
            </Typography>
            {hasUnsavedImages && (
              <Button
                variant="contained"
                onClick={uploadImages}
                disabled={uploading}
                startIcon={<UploadIcon />}
                size="large"
                color="success"
              >
                {uploading ? 'Nahrávám...' : `Nahrát ${images.filter(img => img.file && !img.id).length} obrázků`}
              </Button>
            )}
          </Box>

          {uploading && <LinearProgress sx={{ mb: 2 }} />}

          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ position: 'relative' }}>
                  {image.isPrimary && (
                    <Chip
                      label={t('imageUpload.primary')}
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                      }}
                    />
                  )}
                  
                  <CardMedia
                    component="img"
                    height="150"
                    image={image.thumbnailUrl || image.url}
                    alt={image.originalName}
                    sx={{ 
                      objectFit: 'cover',
                      opacity: image.uploading ? 0.5 : 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setViewingImage(image)}
                  />
                  
                  <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={image.isPrimary ? t('imageUpload.isPrimary') : t('imageUpload.setPrimary')}>
                        <IconButton
                          size="small"
                          onClick={() => setPrimaryImage(index)}
                          disabled={image.isPrimary || !image.id}
                          color={image.isPrimary ? 'primary' : 'default'}
                        >
                          {image.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={t('imageUpload.viewLarge')}>
                        <IconButton
                          size="small"
                          onClick={() => setViewingImage(image)}
                        >
                          <ZoomInIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Tooltip title={t('imageUpload.remove')}>
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        disabled={image.uploading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                  
                  {image.uploading && (
                    <LinearProgress 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0 
                      }} 
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!viewingImage}
        onClose={() => setViewingImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{viewingImage?.originalName}</DialogTitle>
        <DialogContent>
          {viewingImage && (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={viewingImage.url}
                alt={viewingImage.originalName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
              {viewingImage.size && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {t('imageUpload.fileSize')}: {(viewingImage.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingImage(null)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;