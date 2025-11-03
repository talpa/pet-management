import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, Button } from '@mui/material';

const I18nDebug: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Získáme resource data pro debugging
  const getCurrentResources = () => {
    try {
      const currentLang = i18n.language;
      const resources = i18n.getResourceBundle(currentLang, 'translation');
      return resources;
    } catch (error) {
      return null;
    }
  };

  const resources = getCurrentResources();

  const handleForceReload = () => {
    console.log('🔄 Force reload clicked');
    console.log('i18n store data:', i18n.store.data);
    console.log('Current language:', i18n.language);
    console.log('Resources for current lang:', resources);
    
    // Force language change
    const currentLang = i18n.language;
    i18n.changeLanguage(currentLang === 'cs' ? 'en' : 'cs').then(() => {
      setTimeout(() => {
        i18n.changeLanguage(currentLang);
      }, 100);
    });
  };

  const handleClearCache = () => {
    console.log('🗑️ Clear cache clicked');
    localStorage.removeItem('language');
    localStorage.removeItem('i18nextLng');
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        i18n Debug Information
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography><strong>Current Language:</strong> {i18n.language}</Typography>
        <Typography><strong>Loaded Languages:</strong> {i18n.languages.join(', ')}</Typography>
        <Typography><strong>Ready:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</Typography>
        <Typography><strong>localStorage language:</strong> {localStorage.getItem('language') || 'not set'}</Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Test Translations:
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography><strong>common.loading:</strong> "{t('common.loading')}"</Typography>
        <Typography><strong>statistics.title:</strong> "{t('statistics.title')}"</Typography>
        <Typography><strong>animals.tabs.basic:</strong> "{t('animals.tabs.basic')}"</Typography>
        <Typography><strong>animals.title:</strong> "{t('animals.title')}"</Typography>
        <Typography><strong>Non-existent key:</strong> "{t('non.existent.key')}"</Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Test with Fallbacks:
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography><strong>statistics.title with fallback:</strong> "{t('statistics.title', 'Fallback Text')}"</Typography>
        <Typography><strong>animals.tabs.basic with fallback:</strong> "{t('animals.tabs.basic', 'Fallback Basic')}"</Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Resources Info:
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography><strong>Available Namespaces:</strong> {Object.keys(i18n.store.data[i18n.language] || {}).join(', ')}</Typography>
        <Typography><strong>Has CS Resources:</strong> {i18n.hasResourceBundle('cs', 'translation') ? 'Yes' : 'No'}</Typography>
        <Typography><strong>Has EN Resources:</strong> {i18n.hasResourceBundle('en', 'translation') ? 'Yes' : 'No'}</Typography>
      </Box>

      {resources && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Current Resource Animals Section:
          </Typography>
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <div><strong>Has animals:</strong> {resources.animals ? 'Yes' : 'No'}</div>
            {resources.animals && (
              <>
                <div><strong>Has animals.tabs:</strong> {resources.animals.tabs ? 'Yes' : 'No'}</div>
                {resources.animals.tabs && (
                  <>
                    <div><strong>animals.tabs.basic:</strong> "{resources.animals.tabs.basic}"</div>
                    <div><strong>animals.tabs keys:</strong> {Object.keys(resources.animals.tabs).join(', ')}</div>
                  </>
                )}
                <div><strong>Animals top-level keys:</strong> {Object.keys(resources.animals).join(', ')}</div>
              </>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Debug Actions:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleForceReload}>
            Force i18n Reload
          </Button>
          <Button variant="outlined" color="warning" onClick={handleClearCache}>
            Clear Cache & Reload
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 2, bgcolor: '#f0f0f0', p: 2, borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Raw store data keys:</strong> {Object.keys(i18n.store.data).join(', ')}<br/>
          <strong>Current lang store:</strong> {Object.keys(i18n.store.data[i18n.language] || {}).join(', ')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default I18nDebug;