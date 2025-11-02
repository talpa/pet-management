import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import UserPermissionsManagement from './components/UserPermissionsManagement';
import StatisticsDashboard from './components/StatisticsDashboard';

import AnimalSpeciesManagement from './components/AnimalSpeciesManagement';
import AnimalManagement from './components/AnimalManagement';
import AnimalDetail from './components/AnimalDetail';
import PublicHomePage from './components/PublicHomePage';
import ClassicLogin from './components/ClassicLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import MyAnimalsPage from './components/MyAnimalsPage';
import UserProfilePage from './components/UserProfilePage';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { checkAuth } from './store/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app start only if not already initialized
    if (!initialized) {
      console.log('🚀 App starting - checking auth');
      dispatch(checkAuth());
    }
  }, [dispatch, initialized]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<ClassicLogin />} />
        <Route path="/animal/:seoUrl" element={<AnimalDetail />} />
        <Route path="/" element={<PublicHomePage />} />
        
        {/* User-specific routes */}
        <Route 
          path="/my-animals" 
          element={
            <ProtectedRoute>
              <MyAnimalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserProfilePage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Animal editing routes */}
        <Route 
          path="/animals/new" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AnimalManagement editMode="create" />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/animals/:id/edit" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AnimalManagement editMode="edit" />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin-only routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/permissions" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <UserPermissionsManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/animal-species" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <AnimalSpeciesManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/statistics" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <StatisticsDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/animals" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <AnimalManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;