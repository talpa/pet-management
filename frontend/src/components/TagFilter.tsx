import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  Paper,
  Collapse,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
import apiClient from '../services/api';
import { Tag } from './TagInput';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showTitle?: boolean;
  maxTagsVisible?: number;
}

const TagFilter: React.FC<TagFilterProps> = ({
  selectedTags,
  onTagsChange,
  showTitle = true,
  maxTagsVisible = 10,
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: Tag[] }>('/tags');
        // Sort by usage count (most used first) and then by name
        const sortedTags = (response.data.data || []).sort((a: Tag, b: Tag) => {
          if (a.usage_count !== b.usage_count) {
            return (b.usage_count || 0) - (a.usage_count || 0);
          }
          return a.name.localeCompare(b.name);
        });
        setAvailableTags(sortedTags);
        setError(null);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('Nepodařilo se načíst dostupné tagy');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    
    onTagsChange(newSelectedTags);
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const getContrastColor = (backgroundColor: string): string => {
    if (!backgroundColor) return '#000000';
    
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const visibleTags = expanded ? availableTags : availableTags.slice(0, maxTagsVisible);
  const hasMoreTags = availableTags.length > maxTagsVisible;

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2">Načítám tagy...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {showTitle && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList />
          <Typography variant="h6">Filtrovat podle tagů</Typography>
          {selectedTags.length > 0 && (
            <Button size="small" onClick={handleClearAll}>
              Vymazat vše ({selectedTags.length})
            </Button>
          )}
        </Box>
      )}

      <Grid container spacing={1}>
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <Grid item key={tag.id}>
              <Chip
                label={`${tag.name} ${tag.usage_count ? `(${tag.usage_count})` : ''}`}
                onClick={() => handleTagClick(tag.name)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: isSelected 
                    ? (tag.color || '#1976d2')
                    : 'transparent',
                  color: isSelected 
                    ? getContrastColor(tag.color || '#1976d2')
                    : (tag.color || '#1976d2'),
                  borderColor: tag.color || '#1976d2',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isSelected 
                      ? (tag.color || '#1976d2')
                      : `${tag.color || '#1976d2'}20`,
                  },
                }}
                size="small"
              />
            </Grid>
          );
        })}
      </Grid>

      {hasMoreTags && (
        <Box mt={2} textAlign="center">
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          >
            {expanded 
              ? 'Zobrazit méně' 
              : `Zobrazit všechny (${availableTags.length - maxTagsVisible} dalších)`
            }
          </Button>
        </Box>
      )}

      {selectedTags.length > 0 && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Aktivní filtry: {selectedTags.join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TagFilter;