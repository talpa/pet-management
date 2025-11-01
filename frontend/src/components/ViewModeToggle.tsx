import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';

interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onModeChange: (mode: 'grid' | 'list') => void;
  size?: 'small' | 'medium' | 'large';
  gridTooltip?: string;
  listTooltip?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onModeChange,
  size = 'small',
  gridTooltip = 'Kaskádový pohled',
  listTooltip = 'Seznamový pohled',
}) => {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, newViewMode) => {
        if (newViewMode !== null) {
          onModeChange(newViewMode);
        }
      }}
      aria-label="view mode"
      size={size}
    >
      <ToggleButton value="grid" aria-label="grid view">
        <Tooltip title={gridTooltip}>
          <GridViewIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="list" aria-label="list view">
        <Tooltip title={listTooltip}>
          <ListViewIcon />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;