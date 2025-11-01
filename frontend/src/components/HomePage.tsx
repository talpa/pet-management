import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Container,
} from '@mui/material';
import { People, Dashboard, Storage } from '@mui/icons-material';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers, UserState } from '../store/userSlice';
import { User } from '../types/User';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user as UserState);
  const { users, loading } = userState;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: <People fontSize="large" />,
      color: 'primary',
    },
    {
      title: 'Active Users',
      value: users?.filter((user: User) => user.status === 'active').length || 0,
      icon: <Dashboard fontSize="large" />,
      color: 'success',
    },
    {
      title: 'Database Records',
      value: users?.length || 0,
      icon: <Storage fontSize="large" />,
      color: 'info',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Fullstack TypeScript App
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          A modern React application with Redux, Material-UI, and TypeScript
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {loading ? '...' : stat.value}
                    </Typography>
                    <Typography color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body1" paragraph>
                Manage users with full CRUD operations, filtering, and sorting capabilities.
              </Typography>
              <Button
                component={Link}
                to="/users"
                variant="contained"
                color="primary"
              >
                View User Table
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                <Storage fontSize="large" />
                User Permissions
              </Typography>
              <Typography variant="body1" paragraph>
                Manage user permissions and access rights with role-based security.
              </Typography>
              <Button
                component={Link}
                to="/permissions"
                variant="contained"
                color="secondary"
              >
                Manage Permissions
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="TypeScript" color="primary" />
                <Chip label="React" color="secondary" />
                <Chip label="Redux Toolkit" color="success" />
                <Chip label="Material-UI" color="info" />
                <Chip label="Docker" color="warning" />
                <Chip label="PostgreSQL" color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;