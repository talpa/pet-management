import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Pets as PetsIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { statisticsApi } from '../services/statisticsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface SystemStatsData {
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

interface PageStatsData {
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

interface AnimalStatsData {
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

interface LocationStatsData {
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

const StatisticsDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [systemStats, setSystemStats] = useState<SystemStatsData | null>(null);
  const [pageStats, setPageStats] = useState<PageStatsData | null>(null);
  const [animalStats, setAnimalStats] = useState<AnimalStatsData | null>(null);
  const [locationStats, setLocationStats] = useState<LocationStatsData | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handlePeriodChange = (event: any) => {
    setPeriod(event.target.value);
  };

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getSystemStats();
      setSystemStats(data);
    } catch (err: any) {
      setError('Chyba při načítání systémových statistik: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPageStats = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getPageVisitStats(period);
      setPageStats(data);
    } catch (err: any) {
      setError('Chyba při načítání statistik návštěvnosti: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadAnimalStats = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getAnimalStats();
      setAnimalStats(data);
    } catch (err: any) {
      setError('Chyba při načítání statistik zvířat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadLocationStats = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getLocationStats();
      setLocationStats(data);
    } catch (err: any) {
      setError('Chyba při načítání statistik lokací: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  useEffect(() => {
    if (currentTab === 1) {
      loadPageStats();
    } else if (currentTab === 2) {
      loadAnimalStats();
    } else if (currentTab === 3) {
      loadLocationStats();
    }
  }, [currentTab, period]);

  const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color?: string }> = 
    ({ title, value, icon, color = 'primary.main' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color, mr: 1 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <BarChartIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Statistiky a Audit Log
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Přehled systému" icon={<TrendingUpIcon />} />
          <Tab label="Návštěvnost stránek" icon={<VisibilityIcon />} />
          <Tab label="Statistiky zvířat" icon={<PetsIcon />} />
          <Tab label="Lokace uživatelů" icon={<PeopleIcon />} />
        </Tabs>

        {/* Systémové statistiky */}
        <TabPanel value={currentTab} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : systemStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Celkem uživatelů"
                  value={systemStats.counts.totalUsers}
                  icon={<PeopleIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Celkem zvířat"
                  value={systemStats.counts.totalAnimals}
                  icon={<PetsIcon />}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Aktivní za 24h"
                  value={systemStats.counts.activeUsers24h}
                  icon={<TrendingUpIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Návštěvy za 7 dní"
                  value={systemStats.visits.visits7d}
                  icon={<VisibilityIcon />}
                  color="info.main"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Nové registrace
                    </Typography>
                    <Typography variant="body1">
                      Za 7 dní: <strong>{systemStats.counts.newUsers7d}</strong>
                    </Typography>
                    <Typography variant="body1">
                      Za 30 dní: <strong>{systemStats.counts.newUsers30d}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Návštěvnost
                    </Typography>
                    <Typography variant="body1">
                      Za 24 hodin: <strong>{systemStats.visits.visits24h}</strong>
                    </Typography>
                    <Typography variant="body1">
                      Za 7 dní: <strong>{systemStats.visits.visits7d}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {systemStats.errors.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error">
                        Nejčastější chyby (7 dní)
                      </Typography>
                      {systemStats.errors.map((error, index) => (
                        <Typography key={index} variant="body2">
                          HTTP {error.statusCode} na {error.resource}: <strong>{error.count}×</strong>
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>Načítání...</Typography>
          )}
        </TabPanel>

        {/* Návštěvnost stránek */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Období</InputLabel>
              <Select value={period} label="Období" onChange={handlePeriodChange}>
                <MenuItem value="1d">1 den</MenuItem>
                <MenuItem value="7d">7 dní</MenuItem>
                <MenuItem value="30d">30 dní</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : pageStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Nejnavštěvovanější stránky ({pageStats.period})
                    </Typography>
                    {pageStats.pageStats.slice(0, 10).map((page, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography>{page.resource}</Typography>
                        <Typography><strong>{page.visits} návštěv</strong></Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>Načítání...</Typography>
          )}
        </TabPanel>

        {/* Statistiky zvířat */}
        <TabPanel value={currentTab} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : animalStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Druhy zvířat
                    </Typography>
                    {animalStats.speciesStats.map((species, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography>{species.species}</Typography>
                        <Typography><strong>{species.count}</strong></Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Věkové kategorie
                    </Typography>
                    {animalStats.ageStats.map((age, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography>{age.ageGroup}</Typography>
                        <Typography><strong>{age.count}</strong></Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {animalStats.nameStats.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Nejoblíbenější jména (více než 1×)
                      </Typography>
                      <Grid container spacing={2}>
                        {animalStats.nameStats.map((name, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h6">{name.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {name.count}× použito
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>Načítání...</Typography>
          )}
        </TabPanel>

        {/* Lokace uživatelů */}
        <TabPanel value={currentTab} index={3}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : locationStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Kontaktní informace
                    </Typography>
                    <Typography variant="body1">
                      S telefonem: <strong>{locationStats.contactStats.withPhone}</strong>
                    </Typography>
                    <Typography variant="body1">
                      S Viber: <strong>{locationStats.contactStats.withViber}</strong>
                    </Typography>
                    <Typography variant="body1">
                      S WhatsApp: <strong>{locationStats.contactStats.withWhatsapp}</strong>
                    </Typography>
                    <Typography variant="body1">
                      S Signal: <strong>{locationStats.contactStats.withSignal}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Adresy
                    </Typography>
                    <Typography variant="body1">
                      Kompletní adresy: <strong>{locationStats.completeAddressCount}</strong>
                    </Typography>
                    <Typography variant="body1">
                      Celkem uživatelů: <strong>{locationStats.totalUsers}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {locationStats.addressStats.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Města (z adres)
                      </Typography>
                      {locationStats.addressStats.map((addr, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography>{addr.city || 'Nespecifikováno'}</Typography>
                          <Typography><strong>{addr.count}</strong></Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>Načítání...</Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StatisticsDashboard;