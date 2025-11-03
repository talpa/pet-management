// CSS Compatibility utilities for Material-UI
// Use these sx props for cross-browser compatibility

import { SxProps, Theme } from '@mui/material/styles';

// Backdrop filter with vendor prefixes
export const backdropBlurSx: SxProps<Theme> = {
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // Safari support
};

// User select with vendor prefixes
export const noSelectSx: SxProps<Theme> = {
  userSelect: 'none',
  WebkitUserSelect: 'none', // Safari/Chrome
  MozUserSelect: 'none',    // Firefox
  msUserSelect: 'none',     // IE/Edge
};

// Width stretch/fill-available
export const widthStretchSx: SxProps<Theme> = {
  width: {
    WebkitFillAvailable: '100%', // Chrome/Safari
    MozAvailable: '100%',        // Firefox
    fillAvailable: '100%',       // Standard
  }
};

// Text size adjust
export const textSizeAdjustSx: SxProps<Theme> = {
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%',
};

// Common accessibility utilities
export const visuallyHiddenSx: SxProps<Theme> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Focus visible styles
export const focusVisibleSx: SxProps<Theme> = {
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px',
  },
};

// GPU acceleration for smooth animations
export const gpuAccelerationSx: SxProps<Theme> = {
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
};