export interface AuthResponse {
  access_token: string;
}

export interface MeResponse {
  id: number;
  email: string;
  created_at: string;
}

export interface SuggestedIngredient {
  ingredient_id: number;
  name: string;
  confidence: number;
}

export interface FridgeRecognitionResponse {
  suggested_ingredients: SuggestedIngredient[];
}

export interface PantryItem {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  ingredient_image_url?: string | null;
  amount: number | null;
  unit: string | null;
  created_at: string;
}

export interface IngredientSearchItem {
  id: number;
  name: string;
  category: string | null;
  image_url: string | null;
}

export interface CheapestProduct {
  name: string;
  store: string | null;
  price_cents: number | null;
  url: string | null;
}

export interface MissingIngredient {
  ingredient_id: number;
  name: string;
  amount: number | null;
  unit: string | null;
  cheapest_product?: CheapestProduct | null;
}

export interface RecommendedRecipe {
  recipe_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  cooking_time_minutes: number | null;
  servings: number | null;
  missing_count?: number;
  missing_ingredients: MissingIngredient[];
}

export interface RecommendationsResponse {
  no_buy: RecommendedRecipe[];
  need_buy: RecommendedRecipe[];
}

export interface CookingStep {
  step_id: number;
  position: number;
  title: string | null;
  description: string;
  estimated_minutes: number | null;
  completed: boolean;
  completed_at: string | null;
}

export interface CookingSessionResponse {
  id: number;
  recipe_id: number;
  recipe_name: string;
  status: 'started' | 'finished';
  started_at: string | null;
  finished_at: string | null;
  steps: CookingStep[];
}
