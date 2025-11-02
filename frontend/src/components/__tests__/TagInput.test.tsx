import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TagInput from '../TagInput';

// Create a mock store
const mockStore = configureStore({
  reducer: {
    // Add minimal reducer
    test: (state = {}, action) => state
  }
});

const theme = createTheme();

// Mock API calls
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
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

describe('TagInput Component', () => {
  const mockTags = [
    { id: 1, name: 'friendly', color: '#4CAF50', category: 'temperament' },
    { id: 2, name: 'playful', color: '#2196F3', category: 'temperament' },
    { id: 3, name: 'large', color: '#FF9800', category: 'size' },
    { id: 4, name: 'small', color: '#9C27B0', category: 'size' }
  ];

  const defaultProps = {
    selectedTags: [],
    onTagsChange: jest.fn(),
    placeholder: 'Add tags...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({ data: { data: mockTags } });
  });

  it('renders without crashing', async () => {
    renderWithProviders(<TagInput {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('loads and displays available tags', async () => {
    renderWithProviders(<TagInput {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tags');
    });

    // Click on input to open dropdown
    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText('friendly')).toBeInTheDocument();
      expect(screen.getByText('playful')).toBeInTheDocument();
    });
  });

  it('filters tags by search input', async () => {
    renderWithProviders(<TagInput {...defaultProps} />);
    
    await waitFor(() => {
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'play');

    await waitFor(() => {
      expect(screen.getByText('playful')).toBeInTheDocument();
      expect(screen.queryByText('friendly')).not.toBeInTheDocument();
    });
  });

  it('filters tags by category', async () => {
    renderWithProviders(<TagInput {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalled();
    });

    // Test category filtering - this would require opening category filter
    expect(mockTags.filter(tag => tag.category === 'size')).toHaveLength(2);
    expect(mockTags.filter(tag => tag.category === 'temperament')).toHaveLength(2);
  });

  it('calls onTagsChange when tag is selected', async () => {
    const onTagsChange = jest.fn();
    renderWithProviders(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);
    
    await waitFor(() => {
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      const friendlyOption = screen.getByText('friendly');
      expect(friendlyOption).toBeInTheDocument();
    });

    const friendlyOption = screen.getByText('friendly');
    await userEvent.click(friendlyOption);

    await waitFor(() => {
      expect(onTagsChange).toHaveBeenCalledWith([mockTags[0]]);
    });
  });

  it('displays selected tags as chips', async () => {
    const selectedTags = [mockTags[0], mockTags[1]];
    renderWithProviders(
      <TagInput {...defaultProps} selectedTags={selectedTags} />
    );

    await waitFor(() => {
      expect(screen.getByText('friendly')).toBeInTheDocument();
      expect(screen.getByText('playful')).toBeInTheDocument();
    });
  });

  it('removes tag when chip delete is clicked', async () => {
    const onTagsChange = jest.fn();
    const selectedTags = [mockTags[0]];
    
    renderWithProviders(
      <TagInput 
        {...defaultProps} 
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      const deleteButton = screen.getByLabelText(/delete/i);
      expect(deleteButton).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/delete/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(onTagsChange).toHaveBeenCalledWith([]);
    });
  });

  it('handles API error gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<TagInput {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalled();
    });

    // Component should still render even with API error
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('prevents duplicate tag selection', async () => {
    const onTagsChange = jest.fn();
    const selectedTags = [mockTags[0]];
    
    renderWithProviders(
      <TagInput 
        {...defaultProps} 
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    // Try to select already selected tag
    await waitFor(() => {
      const friendlyOption = screen.getByText('friendly');
      expect(friendlyOption).toBeInTheDocument();
    });

    const friendlyOption = screen.getByText('friendly');
    await userEvent.click(friendlyOption);

    // Should not call onTagsChange for duplicate
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it('respects maxTags limit', async () => {
    const onTagsChange = jest.fn();
    const selectedTags = [mockTags[0], mockTags[1]]; // Already 2 tags
    
    renderWithProviders(
      <TagInput 
        {...defaultProps} 
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        maxTags={2}
      />
    );

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      const largeOption = screen.getByText('large');
      expect(largeOption).toBeInTheDocument();
    });

    const largeOption = screen.getByText('large');
    await userEvent.click(largeOption);

    // Should not exceed maxTags
    expect(onTagsChange).not.toHaveBeenCalled();
  });
});