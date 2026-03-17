class RecipeRecommender
  def initialize(user, max_missing: 3)
    @user = user
    @max_missing = max_missing
  end

  def call
    pantry = build_pantry_hash
    no_buy = []
    need_buy = []

    recipes_with_ingredients.each do |recipe|
      ri = recipe.recipe_ingredients
      total = ri.size
      next if total == 0

      missing = []
      ri.each do |recipe_ingredient|
        pantry_amount = pantry[recipe_ingredient.ingredient_id]
        if pantry_amount.nil? || (recipe_ingredient.amount && pantry_amount < recipe_ingredient.amount)
          missing << recipe_ingredient
        end
      end

      missing_count = missing.size
      match_ratio = (total - missing_count).to_f / total

      next if match_ratio < 0.5
      next if missing_count > @max_missing

      entry = build_entry(recipe, missing)

      if missing_count == 0
        no_buy << entry
      else
        need_buy << entry
      end
    end

    need_buy.sort_by! { |e| [e[:missing_count], e[:cooking_time_minutes]] }

    { no_buy: no_buy, need_buy: need_buy }
  end

  private

  def build_pantry_hash
    @user.pantry_items.pluck(:ingredient_id, :amount).each_with_object({}) do |(id, amount), h|
      h[id] = amount || Float::INFINITY
    end
  end

  def recipes_with_ingredients
    Recipe.includes(recipe_ingredients: { ingredient: :products }).all
  end

  def build_entry(recipe, missing)
    missing_ingredients = missing.map do |ri|
      cheapest = ri.ingredient.products.min_by(&:price_cents)
      {
        ingredient_id: ri.ingredient_id,
        name: ri.ingredient.name,
        amount: ri.amount,
        unit: ri.unit,
        cheapest_product: cheapest ? { name: cheapest.name, store: cheapest.store, price_cents: cheapest.price_cents, url: cheapest.url } : nil
      }
    end

    {
      recipe_id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      image_url: recipe.image_url,
      cooking_time_minutes: recipe.cooking_time_minutes,
      servings: recipe.servings,
      missing_count: missing.size,
      missing_ingredients: missing_ingredients
    }
  end
end
