import api from './api';

export interface SystemStatsData {
  counts: {
    totalUsers: number;
    totalAnimals: number;
    activeUsers24h: number;
    newUsers7d: number;
    newUsers30d: number;
  };
  visits: {
    visits24h: number;
    visits7d: number;
  };
  errors: Array<{
    statusCode: number;
    resource: string;
    count: number;
  }>;
  generatedAt: string;
}

export interface PageStatsData {
  pageStats: Array<{
    resource: string;
    visits: number;
    avgResponseTime: number;
  }>;
  dailyStats: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  totalPages: number;
  period: string;
}

export interface AnimalStatsData {
  speciesStats: Array<{
    species: string;
    count: number;
  }>;
  ageStats: Array<{
    ageGroup: string;
    count: number;
  }>;
  nameStats: Array<{
    name: string;
    count: number;
  }>;
  totalAnimals: number;
}

export interface LocationStatsData {
  addressStats: Array<{
    city: string;
    count: number;
  }>;
  completeAddressCount: number;
  contactStats: {
    withPhone: number;
    withViber: number;
    withWhatsapp: number;
    withSignal: number;
  };
  totalUsers: number;
}

export interface StoredStatsData {
  statistics: Array<{
    id: number;
    date: string;
    metric: string;
    category: string;
    value: number;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const statisticsApi = {
  // Získání systémových statistik
  getSystemStats: async (): Promise<SystemStatsData> => {
    const response = await api.get('/statistics/system');
    return response.data;
  },

  // Získání statistik návštěvnosti stránek
  getPageVisitStats: async (period: string = '7d', startDate?: string, endDate?: string): Promise<PageStatsData> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/statistics/page-visits?${params.toString()}`);
    return response.data;
  },

  // Získání statistik zvířat
  getAnimalStats: async (): Promise<AnimalStatsData> => {
    const response = await api.get('/statistics/animals');
    return response.data;
  },

  // Získání statistik lokací
  getLocationStats: async (): Promise<LocationStatsData> => {
    const response = await api.get('/statistics/locations');
    return response.data;
  },

  // Uložení statistiky
  saveStatistic: async (data: {
    date: string;
    metric: string;
    category: string;
    value: number;
    metadata?: any;
  }): Promise<{ statistic: any; created: boolean }> => {
    const response = await api.post('/statistics/save', data);
    return response.data;
  },

  // Získání uložených statistik
  getStoredStats: async (filters?: {
    metric?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<StoredStatsData> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/statistics/stored?${params.toString()}`);
    return response.data;
  },

  // Bulk operace pro statistiky (pro admin účely)
  bulkSaveStatistics: async (statistics: Array<{
    date: string;
    metric: string;
    category: string;
    value: number;
    metadata?: any;
  }>): Promise<{ saved: number; errors: any[] }> => {
    const results = { saved: 0, errors: [] as any[] };
    
    for (const stat of statistics) {
      try {
        await statisticsApi.saveStatistic(stat);
        results.saved++;
      } catch (error: any) {
        results.errors.push({
          data: stat,
          error: error.response?.data?.message || error.message
        });
      }
    }
    
    return results;
  }
};

export default statisticsApi;