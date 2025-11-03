import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
// Temporarily disabled I18nDebug
// import I18nDebug from './I18nDebug';
import { statisticsApi } from '../services/statisticsApi';
import { BarChart, PieChart, LineChart, DonutChart } from './Charts';

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
  const { t, i18n, ready } = useTranslation();
  
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
        {t('statistics.title', 'Statistiky a Audit Log')}
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
          <Tab label={t('statistics.tabs.systemOverview', 'Přehled systému')} icon={<TrendingUpIcon />} />
          <Tab label={t('statistics.tabs.pageViews', 'Návštěvnost stránek')} icon={<VisibilityIcon />} />
          <Tab label={t('statistics.tabs.animalStats', 'Statistiky zvířat')} icon={<PetsIcon />} />
          <Tab label={t('statistics.tabs.userLocations', 'Lokace uživatelů')} icon={<PeopleIcon />} />
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
                  title={t('statistics.cards.totalUsers', 'Celkem uživatelů')}
                  value={systemStats.counts.totalUsers}
                  icon={<PeopleIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title={t('statistics.cards.totalAnimals', 'Celkem zvířat')}
                  value={systemStats.counts.totalAnimals}
                  icon={<PetsIcon />}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title={t('statistics.cards.activeUsers24h', 'Aktivní za 24h')}
                  value={systemStats.counts.activeUsers24h}
                  icon={<TrendingUpIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title={t('statistics.cards.visits7d', 'Návštěvy za 7 dní')}
                  value={systemStats.visits.visits7d}
                  icon={<VisibilityIcon />}
                  color="info.main"
                />
              </Grid>
              {/* Graf nových registrací */}
              <Grid item xs={12} md={6}>
                <BarChart
                  title={t('statistics.cards.newRegistrations', 'Nové registrace')}
                  data={[
                    { label: t('statistics.periods.7days', 'Za 7 dní'), value: systemStats.counts.newUsers7d },
                    { label: t('statistics.periods.30days', 'Za 30 dní'), value: systemStats.counts.newUsers30d }
                  ]}
                  color="#2e7d32"
                  height={300}
                />
              </Grid>
              {/* Graf návštěvnosti */}
              <Grid item xs={12} md={6}>
                <BarChart
                  title={t('statistics.cards.visitStats', 'Návštěvnost')}
                  data={[
                    { label: t('statistics.periods.24hours', 'Za 24 hodin'), value: systemStats.visits.visits24h },
                    { label: t('statistics.periods.7days', 'Za 7 dní'), value: systemStats.visits.visits7d }
                  ]}
                  color="#0288d1"
                  height={300}
                />
              </Grid>
              {/* Donut graf přehledu systému */}
              <Grid item xs={12} md={6}>
                <DonutChart
                  title={t('statistics.cards.systemOverview', 'Přehled systému')}
                  data={[
                    { label: t('statistics.labels.users', 'Uživatelé'), value: systemStats.counts.totalUsers },
                    { label: t('statistics.labels.animals', 'Zvířata'), value: systemStats.counts.totalAnimals },
                    { label: t('statistics.labels.active24h', 'Aktivní (24h)'), value: systemStats.counts.activeUsers24h }
                  ]}
                  centerText={`${systemStats.counts.totalUsers + systemStats.counts.totalAnimals}`}
                  height={300}
                />
              </Grid>
              {systemStats.errors.length > 0 && (
                <Grid item xs={12} md={6}>
                  <BarChart
                    title={t('statistics.cards.topErrors', 'Nejčastější chyby (7 dní)')}
                    data={systemStats.errors.map(error => ({
                      label: `HTTP ${error.statusCode}`,
                      value: error.count
                    }))}
                    color="#d32f2f"
                    height={300}
                  />
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>{t('statistics.loading', 'Načítání...')}</Typography>
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
              {/* Graf nejnavštěvovanějších stránek */}
              <Grid item xs={12} lg={8}>
                <BarChart
                  title={`Nejnavštěvovanější stránky (${pageStats.period})`}
                  data={pageStats.pageStats.slice(0, 10).map(page => ({
                    label: page.resource,
                    value: page.visits
                  }))}
                  color="#1976d2"
                  height={400}
                />
              </Grid>

              {/* Donut graf top 5 stránek */}
              <Grid item xs={12} lg={4}>
                <DonutChart
                  title="Top 5 stránek"
                  data={pageStats.pageStats.slice(0, 5).map(page => ({
                    label: page.resource,
                    value: page.visits
                  }))}
                  centerText={pageStats.totalPages.toString()}
                  height={400}
                />
              </Grid>

              {/* Graf denních statistik (pokud existují) */}
              {pageStats.dailyStats && pageStats.dailyStats.length > 0 && (
                <Grid item xs={12}>
                  <LineChart
                    title={`Denní návštěvnost (${pageStats.period})`}
                    data={pageStats.dailyStats.map(day => ({
                      label: new Date(day.date).toLocaleDateString('cs-CZ'),
                      value: day.visits,
                      secondaryValue: day.uniqueVisitors
                    }))}
                    showSecondaryLine={true}
                    secondaryLabel="Unikátní návštěvníci"
                    height={350}
                  />
                </Grid>
              )}

              {/* Tabulka s detaily */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Detaily návštěvnosti ({pageStats.period})
                    </Typography>
                    {pageStats.pageStats.slice(0, 10).map((page, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: index < 9 ? '1px solid #eee' : 'none' }}>
                        <Typography>{page.resource}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography><strong>{page.visits} návštěv</strong></Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg. {page.avgResponseTime}ms
                          </Typography>
                        </Box>
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
              {/* Graf druhů zvířat */}
              <Grid item xs={12} md={6}>
                <PieChart
                  title="Druhy zvířat"
                  data={animalStats.speciesStats.map(species => ({
                    label: species.species,
                    value: species.count
                  }))}
                  height={350}
                />
              </Grid>

              {/* Graf věkových kategorií */}
              <Grid item xs={12} md={6}>
                <DonutChart
                  title="Věkové kategorie"
                  data={animalStats.ageStats.map(age => ({
                    label: age.ageGroup,
                    value: age.count
                  }))}
                  centerText={animalStats.totalAnimals.toString()}
                  height={350}
                />
              </Grid>

              {/* Sloupcový graf druhů */}
              <Grid item xs={12} lg={8}>
                <BarChart
                  title="Počet zvířat podle druhů"
                  data={animalStats.speciesStats.map(species => ({
                    label: species.species,
                    value: species.count
                  }))}
                  color="#dc004e"
                  height={350}
                />
              </Grid>

              {/* Přehled dat v tabulce */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Detaily druhů
                    </Typography>
                    {animalStats.speciesStats.map((species, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: index < animalStats.speciesStats.length - 1 ? '1px solid #eee' : 'none' }}>
                        <Typography>{species.species}</Typography>
                        <Typography><strong>{species.count}</strong></Typography>
                      </Box>
                    ))}
                    <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #eee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Celkem:</Typography>
                        <Typography variant="h6" color="primary"><strong>{animalStats.totalAnimals}</strong></Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Graf věkových kategorií jako bar chart */}
              <Grid item xs={12} md={6}>
                <BarChart
                  title="Věkové rozložení"
                  data={animalStats.ageStats.map(age => ({
                    label: age.ageGroup,
                    value: age.count
                  }))}
                  color="#2e7d32"
                  height={300}
                />
              </Grid>

              {animalStats.nameStats.length > 0 && (
                <Grid item xs={12} md={6}>
                  <BarChart
                    title="Nejoblíbenější jména"
                    data={animalStats.nameStats.slice(0, 8).map(name => ({
                      label: name.name,
                      value: name.count
                    }))}
                    color="#ed6c02"
                    height={300}
                  />
                </Grid>
              )}

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
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
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
              {/* Graf kontaktních informací */}
              <Grid item xs={12} md={6}>
                <BarChart
                  title="Kontaktní informace"
                  data={[
                    { label: 'S telefonem', value: locationStats.contactStats.withPhone },
                    { label: 'S Viber', value: locationStats.contactStats.withViber },
                    { label: 'S WhatsApp', value: locationStats.contactStats.withWhatsapp },
                    { label: 'S Signal', value: locationStats.contactStats.withSignal }
                  ]}
                  color="#1976d2"
                  height={300}
                />
              </Grid>

              {/* Donut graf přehledu adres */}
              <Grid item xs={12} md={6}>
                <DonutChart
                  title="Přehled adres"
                  data={[
                    { label: 'Kompletní adresy', value: locationStats.completeAddressCount },
                    { label: 'Neúplné adresy', value: locationStats.totalUsers - locationStats.completeAddressCount }
                  ]}
                  centerText={locationStats.totalUsers.toString()}
                  height={300}
                />
              </Grid>

              {locationStats.addressStats.length > 0 && (
                <>
                  {/* Graf měst */}
                  <Grid item xs={12} lg={8}>
                    <BarChart
                      title="Rozložení podle měst"
                      data={locationStats.addressStats.map(addr => ({
                        label: addr.city || 'Nespecifikováno',
                        value: addr.count
                      }))}
                      color="#2e7d32"
                      height={350}
                    />
                  </Grid>

                  {/* Pie chart top měst */}
                  <Grid item xs={12} lg={4}>
                    <PieChart
                      title="Top města"
                      data={locationStats.addressStats.slice(0, 6).map(addr => ({
                        label: addr.city || 'Nespecifikováno',
                        value: addr.count
                      }))}
                      height={350}
                    />
                  </Grid>
                </>
              )}

              {/* Donut graf kontaktních metod */}
              <Grid item xs={12} md={6}>
                <DonutChart
                  title="Komunikační kanály"
                  data={[
                    { label: 'Telefon', value: locationStats.contactStats.withPhone },
                    { label: 'Viber', value: locationStats.contactStats.withViber },
                    { label: 'WhatsApp', value: locationStats.contactStats.withWhatsapp },
                    { label: 'Signal', value: locationStats.contactStats.withSignal }
                  ].filter(item => item.value > 0)}
                  height={300}
                />
              </Grid>

              {/* Souhrn jako karta */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Souhrn lokací a kontaktů
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        Celkem uživatelů: <strong>{locationStats.totalUsers}</strong>
                      </Typography>
                      <Typography variant="body1">
                        Kompletní adresy: <strong>{locationStats.completeAddressCount}</strong>
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Pokrytí adres: {((locationStats.completeAddressCount / locationStats.totalUsers) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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

              {locationStats.addressStats.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Města (z adres)
                      </Typography>
                      <Grid container spacing={2}>
                        {locationStats.addressStats.map((addr, index) => (
                          <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="h6" color="primary">
                                {addr.count}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {addr.city || 'Nespecifikováno'}
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
      </Paper>
    </Box>
  );
};

export default StatisticsDashboard;