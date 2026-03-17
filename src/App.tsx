import type { ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PageTransition } from './components';
import { isAuthenticated } from './lib/auth';
import './styles/variables.css';
import './styles/reset.css';
import './styles/animations.css';
import './App.css';

import { HomePage } from './pages/HomePage/HomePage';
import { PreferencesPage } from './pages/PreferencesPage/PreferencesPage';
import { ProcessingPage } from './pages/ProcessingPage/ProcessingPage';
import { ProductsPage } from './pages/ProductsPage/ProductsPage';
import { RecipesPage } from './pages/RecipesPage/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage/RecipeDetailPage';
import { IngredientsListPage } from './pages/IngredientsListPage/IngredientsListPage';
import { CookingPage } from './pages/CookingPage/CookingPage';
import { CompletionPage } from './pages/CompletionPage/CompletionPage';
import { AuthPage } from './pages/AuthPage/AuthPage';

function RequireAuth({ children }: { children: ReactElement }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/preferences" element={<RequireAuth><PreferencesPage /></RequireAuth>} />
        <Route path="/processing" element={<RequireAuth><ProcessingPage /></RequireAuth>} />
        <Route path="/products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
        <Route path="/recipes" element={<RequireAuth><RecipesPage /></RequireAuth>} />
        <Route path="/recipe/:recipeId" element={<RequireAuth><RecipeDetailPage /></RequireAuth>} />
        <Route path="/ingredients" element={<RequireAuth><IngredientsListPage /></RequireAuth>} />
        <Route path="/cooking/:sessionId" element={<RequireAuth><CookingPage /></RequireAuth>} />
        <Route path="/complete" element={<RequireAuth><CompletionPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default App;
