import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api';

interface QrCodeGeneratorProps {
  animalId: number;
  animalName: string;
  seoUrl?: string;
  onSeoUrlRequired?: () => void;
}

interface QrCodeData {
  qrCodeUrl: string;
  seoUrl: string;
  shareableUrl: string;
  format: string;
  size: number;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  animalId,
  animalName,
  seoUrl,
  onSeoUrlRequired,
}) => {
  const { t } = useTranslation();
  const [qrData, setQrData] = useState<QrCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [size, setSize] = useState(256);
  const [customText, setCustomText] = useState('');

  const generateQrCode = async (options?: {
    format?: 'png' | 'svg';
    size?: number;
    includeText?: boolean;
    customText?: string;
  }) => {
    if (!seoUrl) {
      onSeoUrlRequired?.();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/animals/${animalId}/qr-code`, {
        format: options?.format || format,
        size: options?.size || size,
        includeText: options?.includeText || false,
        customText: options?.customText || customText,
      });

      if (response.data.success) {
        setQrData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('qrCode.errors.generateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = async (downloadFormat?: 'png' | 'svg', downloadSize?: number) => {
    if (!qrData && !seoUrl) return;

    try {
      const response = await apiClient.post(`/animals/${animalId}/qr-code`, {
        format: downloadFormat || format,
        size: downloadSize || size,
        includeText: !!customText,
        customText,
        download: true,
      }, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${animalName}-qr-code.${downloadFormat || format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || t('qrCode.errors.downloadFailed'));
    }
  };

  const shareQrCode = async () => {
    if (!qrData?.shareableUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('qrCode.shareTitle', { name: animalName }),
          text: t('qrCode.shareText', { name: animalName }),
          url: qrData.shareableUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(qrData.shareableUrl);
      // You might want to show a toast notification here
    }
  };

  const printQrCode = () => {
    if (!qrData?.qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('qrCode.printTitle', { name: animalName })}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container { 
                margin: 20px auto; 
                max-width: 400px; 
              }
              .qr-code { 
                width: 100%; 
                height: auto; 
              }
              .animal-info { 
                margin-top: 20px; 
                font-size: 18px; 
              }
              .url-info { 
                margin-top: 10px; 
                font-size: 14px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .qr-container { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${animalName}</h1>
              <img src="${qrData.qrCodeUrl}" alt="QR Code" class="qr-code" />
              <div class="animal-info">
                ${t('qrCode.scanToView')}
              </div>
              <div class="url-info">
                ${qrData.shareableUrl}
              </div>
              ${customText ? `<div class="custom-text">${customText}</div>` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  useEffect(() => {
    if (seoUrl && !qrData) {
      generateQrCode();
    }
  }, [seoUrl]);

  if (!seoUrl) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <QrCodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('qrCode.seoUrlRequired')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('qrCode.seoUrlRequiredDescription')}
        </Typography>
        <Button variant="outlined" onClick={onSeoUrlRequired}>
          {t('qrCode.setSeoUrl')}
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('qrCode.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<QrCodeIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={loading}
        >
          {t('qrCode.customize')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : qrData ? (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={qrData.qrCodeUrl}
                  alt="QR Code"
                  sx={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    maxHeight: 300 
                  }}
                />
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${qrData.format.toUpperCase()} • ${qrData.size}x${qrData.size}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {t('qrCode.actions')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadQrCode()}
                    variant="outlined"
                    fullWidth
                  >
                    {t('qrCode.download')}
                  </Button>
                  
                  <Button
                    startIcon={<ShareIcon />}
                    onClick={shareQrCode}
                    variant="outlined"
                    fullWidth
                  >
                    {t('qrCode.share')}
                  </Button>
                  
                  <Button
                    startIcon={<PrintIcon />}
                    onClick={printQrCode}
                    variant="outlined"
                    fullWidth
                  >
                    {t('qrCode.print')}
                  </Button>
                  
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => generateQrCode()}
                    variant="outlined"
                    fullWidth
                  >
                    {t('qrCode.regenerate')}
                  </Button>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('qrCode.shareableUrl')}:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    wordBreak: 'break-all', 
                    bgcolor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}>
                    {qrData.shareableUrl}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Button
            variant="contained"
            startIcon={<QrCodeIcon />}
            onClick={() => generateQrCode()}
            size="large"
          >
            {t('qrCode.generate')}
          </Button>
        </Box>
      )}

      {/* Customization Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('qrCode.customizeTitle')}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('qrCode.format')}</InputLabel>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'png' | 'svg')}
                  label={t('qrCode.format')}
                >
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="svg">SVG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('qrCode.size')}</InputLabel>
                <Select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  label={t('qrCode.size')}
                >
                  <MenuItem value={128}>128x128</MenuItem>
                  <MenuItem value={256}>256x256</MenuItem>
                  <MenuItem value={512}>512x512</MenuItem>
                  <MenuItem value={1024}>1024x1024</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('qrCode.customText')}
                placeholder={t('qrCode.customTextPlaceholder')}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                multiline
                rows={2}
                helperText={t('qrCode.customTextHelp')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              generateQrCode({
                format,
                size,
                includeText: !!customText,
                customText,
              });
              setDialogOpen(false);
            }}
            variant="contained"
            disabled={loading}
          >
            {t('qrCode.generate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QrCodeGenerator;