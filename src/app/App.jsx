import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import ScanPhotoPage from './pages/ScanPhotoPage/ScanPhotoPage';
import ManualProductsPage from './pages/ManualProductsPage/ManualProductsPage';
import ScannedProductsPage from './pages/ScannedProductsPage/ScannedProductsPage';
import RecipeListPage from './pages/RecipeListPage/RecipeListPage';
import AllRecipesPage from './pages/AllRecipesPage/AllRecipesPage';
import CookingPage from './pages/CookingPage/CookingPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPhotoPage />} />
          <Route path="/products/manual" element={<ManualProductsPage />} />
          <Route path="/products/scanned" element={<ScannedProductsPage />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/recipes/all" element={<AllRecipesPage />} />
          <Route path="/cook/:id" element={<CookingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
