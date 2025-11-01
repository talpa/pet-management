import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';

interface SeoUrlManagerProps {
  animalId?: number;
  initialValue?: string;
  animalName?: string;
  onSeoUrlChange?: (seoUrl: string, isValid: boolean) => void;
  readonly?: boolean;
}

interface UrlCheckResult {
  available: boolean;
  suggestions?: string[];
}

const SeoUrlManager: React.FC<SeoUrlManagerProps> = ({
  animalId,
  initialValue = '',
  animalName = '',
  onSeoUrlChange,
  readonly = false,
}) => {
  const { t } = useTranslation();
  const [seoUrl, setSeoUrl] = useState(initialValue);
  const [checkResult, setCheckResult] = useState<UrlCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Custom debounce implementation
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => func(...args), delay);
    };
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const validateSeoUrl = (url: string): string | null => {
    if (!url) return t('seoUrl.errors.required');
    if (url.length < 3) return t('seoUrl.errors.tooShort');
    if (url.length > 100) return t('seoUrl.errors.tooLong');
    if (!/^[a-z0-9-]+$/.test(url)) return t('seoUrl.errors.invalidFormat');
    if (url.startsWith('-') || url.endsWith('-')) return t('seoUrl.errors.invalidHyphens');
    if (url.includes('--')) return t('seoUrl.errors.doubleHyphens');
    return null;
  };

  const checkSeoUrlAvailability = useCallback(async (url: string) => {
    if (!url || validateSeoUrl(url)) {
      setCheckResult(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await apiClient.get(`/animals/check-seo-url/${encodeURIComponent(url)}`, {
        params: animalId ? { excludeId: animalId } : {},
      });

      if (response.data.success) {
        setCheckResult(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('seoUrl.errors.checkFailed'));
      setCheckResult(null);
    } finally {
      setIsChecking(false);
    }
  }, [animalId, t]);

  const debouncedCheck = useCallback(
    debounce(checkSeoUrlAvailability, 500),
    [checkSeoUrlAvailability]
  );

  const getSuggestions = async () => {
    if (!animalName) return;

    setIsChecking(true);
    try {
      const response = await apiClient.post(`/animals/suggest-seo-url`, {
        params: { 
          name: animalName,
          excludeId: animalId,
        },
      });

      if (response.data.success && response.data.data.suggestions) {
        setCheckResult({
          available: false,
          suggestions: response.data.data.suggestions,
        });
        setShowSuggestions(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('seoUrl.errors.suggestionFailed'));
    } finally {
      setIsChecking(false);
    }
  };

  const handleSeoUrlChange = (value: string) => {
    const cleanValue = generateSlug(value);
    setSeoUrl(cleanValue);
    setShowSuggestions(false);
    
    const validationError = validateSeoUrl(cleanValue);
    const isValid = !validationError;
    
    if (validationError) {
      setError(validationError);
    } else {
      setError(null);
      setCheckResult({ available: true }); // Always mark as available
    }
    
    onSeoUrlChange?.(cleanValue, isValid);
  };

  const applySuggestion = (suggestion: string) => {
    setSeoUrl(suggestion);
    setShowSuggestions(false);
    setCheckResult({ available: true });
    onSeoUrlChange?.(suggestion, true);
  };

  const copyToClipboard = () => {
    if (seoUrl) {
      const fullUrl = `${window.location.origin}/animal/${seoUrl}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  useEffect(() => {
    if (initialValue && initialValue !== seoUrl) {
      setSeoUrl(initialValue);
      // Don't check availability, just validate format
      const validationError = validateSeoUrl(initialValue);
      if (!validationError) {
        setCheckResult({ available: true });
      }
    }
  }, [initialValue]);

  const validationError = validateSeoUrl(seoUrl);
  const isAvailable = checkResult?.available;
  const showError = validationError || (checkResult && !isAvailable && !showSuggestions);
  const showSuccess = !validationError && isAvailable;

  const getFieldColor = (): 'error' | 'success' | 'primary' => {
    if (showError) return 'error';
    if (showSuccess) return 'success';
    return 'primary';
  };

  const getStatusIcon = () => {
    if (isChecking) return <CircularProgress size={20} />;
    if (showSuccess) return <CheckIcon color="success" />;
    if (showError) return <CloseIcon color="error" />;
    return null;
  };

  const getHelperText = () => {
    if (validationError) return validationError;
    if (checkResult && !isAvailable) {
      return t('seoUrl.errors.notAvailable');
    }
    if (isAvailable) return t('seoUrl.available');
    return t('seoUrl.helpText');
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {t('seoUrl.title')}
      </Typography>

      <TextField
        fullWidth
        value={seoUrl}
        onChange={(e) => handleSeoUrlChange(e.target.value)}
        placeholder={t('seoUrl.placeholder')}
        helperText={getHelperText()}
        color={getFieldColor()}
        disabled={readonly}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography variant="body2" color="text.secondary">
                /animal/
              </Typography>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getStatusIcon()}
                {seoUrl && !readonly && (
                  <Tooltip title={t('seoUrl.copyUrl')}>
                    <IconButton size="small" onClick={copyToClipboard}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {animalName && !readonly && (
                  <Tooltip title={t('seoUrl.getSuggestions')}>
                    <IconButton 
                      size="small" 
                      onClick={getSuggestions}
                      disabled={isChecking}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showSuggestions && checkResult?.suggestions && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('seoUrl.suggestions')}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {checkResult.suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => applySuggestion(suggestion)}
                color="primary"
                variant="outlined"
                size="small"
                clickable
              />
            ))}
          </Box>
        </Box>
      )}

      {seoUrl && isAvailable && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'success.50', 
          borderRadius: 1, 
          border: '1px solid',
          borderColor: 'success.200',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <LinkIcon color="success" fontSize="small" />
          <Typography variant="body2" color="success.dark">
            {t('seoUrl.fullUrl')}: 
            <Box component="span" sx={{ fontWeight: 'bold', ml: 0.5 }}>
              {window.location.origin}/animal/{seoUrl}
            </Box>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SeoUrlManager;