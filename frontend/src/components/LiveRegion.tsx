import React from 'react';
import { Box } from '@mui/material';

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
}

const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  politeness = 'polite', 
  atomic = false 
}) => {
  return (
    <Box
      component="div"
      aria-live={politeness}
      aria-atomic={atomic}
      sx={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
};

export default LiveRegion;