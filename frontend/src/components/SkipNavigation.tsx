import React from 'react';
import { Box, Link } from '@mui/material';
import { visuallyHiddenSx, focusVisibleSx } from '../styles/compatibility';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      sx={{
        ...visuallyHiddenSx,
        ...focusVisibleSx,
        '&:focus': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'auto',
          height: 'auto',
          padding: 1,
          margin: 0,
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          zIndex: 9999,
        },
      }}
    >
      {children}
    </Link>
  );
};

const SkipNavigation: React.FC = () => {
  return (
    <Box component="nav" aria-label="Skip navigation">
      <SkipLink href="#main-content">
        Přejít na hlavní obsah
      </SkipLink>
      <SkipLink href="#navigation">
        Přejít na navigaci
      </SkipLink>
    </Box>
  );
};

export default SkipNavigation;