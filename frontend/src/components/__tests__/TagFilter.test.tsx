import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TagFilter from '../TagFilter';

// Create a mock store
const mockStore = configureStore({
  reducer: {
    test: (state = {}, action) => state
  }
});

const theme = createTheme();

// Mock API calls
const mockApiClient = {
  get: jest.fn()
};

jest.mock('../../api/apiClient', () => mockApiClient);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('TagFilter Component', () => {
  const mockTags = [
    { id: 1, name: 'friendly', color: '#4CAF50', category: 'temperament' },
    { id: 2, name: 'playful', color: '#2196F3', category: 'temperament' },
    { id: 3, name: 'large', color: '#FF9800', category: 'size' },
    { id: 4, name: 'small', color: '#9C27B0', category: 'size' }
  ];

  const defaultProps = {
    selectedTags: [] as string[],
    onTagsChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({ data: { data: mockTags } });
  });

  it('renders without crashing', async () => {
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/filter by tags/i)).toBeInTheDocument();
    });
  });

  it('loads and displays available tags', async () => {
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tags');
    });

    await waitFor(() => {
      expect(screen.getByText('friendly')).toBeInTheDocument();
      expect(screen.getByText('playful')).toBeInTheDocument();
      expect(screen.getByText('large')).toBeInTheDocument();
      expect(screen.getByText('small')).toBeInTheDocument();
    });
  });

  it('groups tags by category', async () => {
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('temperament')).toBeInTheDocument();
      expect(screen.getByText('size')).toBeInTheDocument();
    });
  });

  it('calls onTagsChange when tag is selected', async () => {
    const onTagsChange = jest.fn();
    renderWithProviders(<TagFilter {...defaultProps} onTagsChange={onTagsChange} />);
    
    await waitFor(() => {
      const friendlyTag = screen.getByText('friendly');
      expect(friendlyTag).toBeInTheDocument();
    });

    const friendlyTag = screen.getByText('friendly');
    await userEvent.click(friendlyTag);

    expect(onTagsChange).toHaveBeenCalledWith(['friendly']);
  });

  it('shows selected tags as active', async () => {
    const selectedTags = ['friendly'];
    renderWithProviders(
      <TagFilter {...defaultProps} selectedTags={selectedTags} />
    );

    await waitFor(() => {
      const friendlyTag = screen.getByText('friendly');
      expect(friendlyTag.closest('button')).toHaveClass('selected'); // assuming selected class
    });
  });

  it('allows multiple tag selection', async () => {
    const onTagsChange = jest.fn();
    renderWithProviders(<TagFilter {...defaultProps} onTagsChange={onTagsChange} />);
    
    await waitFor(() => {
      expect(screen.getByText('friendly')).toBeInTheDocument();
      expect(screen.getByText('large')).toBeInTheDocument();
    });

    // Select first tag
    const friendlyTag = screen.getByText('friendly');
    await userEvent.click(friendlyTag);

    expect(onTagsChange).toHaveBeenCalledWith(['friendly']);

    // Reset mock to test second selection
    onTagsChange.mockClear();

    // Update props to simulate first tag being selected
    renderWithProviders(
      <TagFilter 
        {...defaultProps} 
        selectedTags={['friendly']}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      const largeTag = screen.getByText('large');
      expect(largeTag).toBeInTheDocument();
    });

    const largeTag = screen.getByText('large');
    await userEvent.click(largeTag);

    expect(onTagsChange).toHaveBeenCalledWith(['friendly', 'large']);
  });

  it('removes tag when selected tag is clicked again', async () => {
    const onTagsChange = jest.fn();
    const selectedTags = ['friendly', 'playful'];
    
    renderWithProviders(
      <TagFilter 
        {...defaultProps} 
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      const friendlyTag = screen.getByText('friendly');
      expect(friendlyTag).toBeInTheDocument();
    });

    const friendlyTag = screen.getByText('friendly');
    await userEvent.click(friendlyTag);

    expect(onTagsChange).toHaveBeenCalledWith(['playful']);
  });

  it('calls onClear when clear button is clicked', async () => {
    const onTagsChange = jest.fn();
    const selectedTags = ['friendly'];
    
    renderWithProviders(
      <TagFilter 
        {...defaultProps} 
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      const clearButton = screen.getByText(/clear/i);
      expect(clearButton).toBeInTheDocument();
    });

    const clearButton = screen.getByText(/clear/i);
    await userEvent.click(clearButton);

    expect(onTagsChange).toHaveBeenCalledWith([]);
  });

  it('shows tag count when tags are selected', async () => {
    const selectedTags = ['friendly', 'playful'];
    
    renderWithProviders(
      <TagFilter {...defaultProps} selectedTags={selectedTags} />
    );

    await waitFor(() => {
      expect(screen.getByText(/2.*selected/i)).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalled();
    });

    // Component should still render even with API error
    expect(screen.getByText(/filter by tags/i)).toBeInTheDocument();
  });

  it('preserves tag colors', async () => {
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      const friendlyTag = screen.getByText('friendly');
      expect(friendlyTag).toBeInTheDocument();
    });

    const friendlyTag = screen.getByText('friendly');
    const tagElement = friendlyTag.closest('button');
    
    // Check that tag has color styling (would need to check actual implementation)
    expect(tagElement).toHaveStyle('background-color: #4CAF50');
  });

  it('shows empty state when no tags available', async () => {
    mockApiClient.get.mockResolvedValue({ data: { data: [] } });
    
    renderWithProviders(<TagFilter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/no tags available/i)).toBeInTheDocument();
    });
  });
});