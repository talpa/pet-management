import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DataState {
  items: any[];
  filteredItems: any[];
  searchTerm: string;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
}

const initialState: DataState = {
  items: [],
  filteredItems: [],
  searchTerm: '',
  sortColumn: null,
  sortDirection: 'asc',
  currentPage: 1,
  itemsPerPage: 10,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      state.filteredItems = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredItems = state.items.filter(item =>
        Object.keys(item).some(key =>
          String(item[key]).toLowerCase().includes(action.payload.toLowerCase())
        )
      );
      state.currentPage = 1;
    },
    setSortColumn: (state, action: PayloadAction<{ column: string; direction: 'asc' | 'desc' }>) => {
      state.sortColumn = action.payload.column;
      state.sortDirection = action.payload.direction;
      
      state.filteredItems.sort((a, b) => {
        const aValue = a[action.payload.column];
        const bValue = b[action.payload.column];
        
        if (action.payload.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
  },
});

export const { setItems, setSearchTerm, setSortColumn, setCurrentPage, setItemsPerPage } = dataSlice.actions;
export default dataSlice.reducer;