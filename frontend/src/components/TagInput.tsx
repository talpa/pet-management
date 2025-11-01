import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  TextField,
  Autocomplete,
  Typography,
  Alert,
} from '@mui/material';
import apiClient from '../services/api';

export interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  usage_count?: number;
}

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Vyberte nebo zadejte tagy...",
  error,
  helperText,
  fullWidth = true,
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: Tag[] }>('/tags');
        setAvailableTags(response.data.data || []);
        setApiError(null);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setApiError('Nepodařilo se načíst dostupné tagy');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagChange = (event: any, newValue: Tag[]) => {
    onTagsChange(newValue);
  };

  const renderTag = (tag: Tag, getTagProps: any) => (
    <Chip
      {...getTagProps()}
      key={tag.id}
      label={tag.name}
      sx={{
        backgroundColor: tag.color || '#e0e0e0',
        color: getContrastColor(tag.color || '#e0e0e0'),
        '& .MuiChip-deleteIcon': {
          color: getContrastColor(tag.color || '#e0e0e0'),
        },
      }}
      size="small"
      variant="filled"
    />
  );

  const renderOption = (props: any, option: Tag) => (
    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={option.name}
        size="small"
        sx={{
          backgroundColor: option.color || '#e0e0e0',
          color: getContrastColor(option.color || '#e0e0e0'),
          minWidth: 'auto',
        }}
      />
      <Box>
        <Typography variant="body2">{option.name}</Typography>
        {option.description && (
          <Typography variant="caption" color="text.secondary">
            {option.description}
          </Typography>
        )}
        {option.usage_count !== undefined && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({option.usage_count}×)
          </Typography>
        )}
      </Box>
    </Box>
  );

  // Get contrast color for text readability
  const getContrastColor = (backgroundColor: string): string => {
    if (!backgroundColor) return '#000000';
    
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <Box>
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}
      
      <Autocomplete
        multiple
        options={availableTags}
        value={selectedTags}
        onChange={handleTagChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        fullWidth={fullWidth}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => renderTag(option, () => getTagProps({ index })))
        }
        renderOption={renderOption}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            error={!!error}
            helperText={error || helperText}
            label="Tagy"
          />
        )}
        sx={{
          '& .MuiAutocomplete-tag': {
            margin: '2px',
          },
        }}
      />
    </Box>
  );
};

export default TagInput;