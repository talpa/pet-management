import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import apiClient from '../services/api';

interface QRCodeDisplayProps {
  animalId: number;
  seoUrl: string;
}

interface QRCodeData {
  qrCodeUrl: string;
  seoUrl: string;
  shareableUrl: string;
  format: string;
  size: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ animalId, seoUrl }) => {
  const { t } = useTranslation();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQRCode();
  }, [animalId, seoUrl]);

  const loadQRCode = async () => {
    if (!seoUrl) {
      setError(t('common.seoUrlNotSet'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(`/animals/${animalId}/qr-code`, {
        format: 'png',
        size: 200,
      });

      if (response.data.success) {
        setQrData(response.data.data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to load QR code:', err);
      setError(t('common.qrCodeLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrData) return;

    try {
      const response = await apiClient.post(`/animals/${animalId}/qr-code`, {
        format: 'png',
        size: 512,
        download: true,
      }, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `animal-${animalId}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download QR code:', err);
    }
  };

  const shareQRCode = async () => {
    if (!qrData?.shareableUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('common.animalProfile'),
          text: t('common.animalProfileDescription'),
          url: qrData.shareableUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(qrData.shareableUrl);
        // TODO: Show toast notification
        console.log('URL copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const copyUrl = async () => {
    if (!qrData?.shareableUrl) return;

    try {
      await navigator.clipboard.writeText(qrData.shareableUrl);
      console.log('URL copied to clipboard');
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {t('common.generatingQR')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mx: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!qrData) {
    return (
      <Alert severity="info" sx={{ mx: 2 }}>
        {t('common.qrCodeNotAvailable')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* QR Code Image */}
      <Box 
        sx={{ 
          display: 'inline-block',
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 2,
          mb: 3
        }}
      >
        <Box
          component="img"
          src={qrData.qrCodeUrl} 
          alt={t('common.qrCodeAlt')}
          sx={{ 
            display: 'block',
            width: 200,
            height: 200,
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Tooltip title={t('common.downloadQR')}>
          <IconButton onClick={downloadQRCode} color="primary">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('common.share')}>
          <IconButton onClick={shareQRCode} color="primary">
            <ShareIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('common.copyLink')}>
          <IconButton onClick={copyUrl} color="primary">
            <CopyIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* URL Preview */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 2,
          display: 'block',
          wordBreak: 'break-all',
          fontSize: '0.75rem'
        }}
      >
        {qrData.shareableUrl}
      </Typography>
    </Box>
  );
};

export default QRCodeDisplay;