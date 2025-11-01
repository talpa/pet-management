import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import UserPermissionsManagement from './components/UserPermissionsManagement';
import UserGroupsManagement from './components/UserGroupsManagement';
import UserGroupMembership from './components/UserGroupMembership';
import OAuth2PermissionManager from './components/OAuth2PermissionManager';
import OAuth2TestPage from './components/OAuth2TestPage';
import OAuthTest from './components/OAuthTest';
import AnimalSpeciesManagement from './components/AnimalSpeciesManagement';
import AnimalManagement from './components/AnimalManagement';
import AnimalDetail from './components/AnimalDetail';
import PublicHomePage from './components/PublicHomePage';
import ClassicLogin from './components/ClassicLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import MyAnimalsPage from './components/MyAnimalsPage';
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
          path="/groups" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <UserGroupsManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/memberships" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <UserGroupMembership />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/oauth-permissions" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <OAuth2PermissionManager />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/oauth-test" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <OAuth2TestPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/oauth-debug" 
          element={
            <ProtectedRoute>
              <AdminLayout requireAdmin={true}>
                <OAuthTest />
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