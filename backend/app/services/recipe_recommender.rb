class RecipeRecommender
  def initialize(user, max_missing = nil, min_match_ratio: nil, **_kwargs)
    @user = user
    @max_missing = max_missing
    @min_match_ratio = min_match_ratio
  end

  def call
    pantry_ids = build_pantry_ids
    no_buy = []
    need_buy = []

    recipes_with_ingredients.each do |recipe|
      recipe_ingredients = recipe.recipe_ingredients
      total = recipe_ingredients.size
      next if total == 0

      matched = []
      missing = []

      recipe_ingredients.each do |recipe_ingredient|
        if pantry_ids.include?(recipe_ingredient.ingredient_id)
          matched << recipe_ingredient
        else
          missing << recipe_ingredient
        end
      end

      matched_count = matched.size
      next if matched_count == 0

      missing_count = missing.size
      match_ratio = matched_count.to_f / total

      entry = build_entry(
        recipe,
        matched,
        missing,
        matched_count,
        missing_count,
        match_ratio
      )

      if missing_count == 0
        no_buy << entry
      else
        need_buy << entry
      end
    end

    sort_entries!(no_buy)
    sort_entries!(need_buy)

    {
      no_buy: no_buy,
      need_buy: need_buy
    }
  end

  private

  def build_pantry_ids
    @user.pantry_items.pluck(:ingredient_id).compact.uniq
  end

  def recipes_with_ingredients
    Recipe.includes(recipe_ingredients: { ingredient: :products }).all
  end

  def sort_entries!(entries)
    entries.sort_by! do |entry|
      [
        -entry[:matched_count],
        -entry[:match_ratio],
        entry[:missing_count],
        entry[:cooking_time_minutes] || 9999,
        entry[:name].to_s
      ]
    end
  end

  def build_entry(recipe, matched, missing, matched_count, missing_count, match_ratio)
    {
      recipe_id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      image_url: recipe.image_url,
      cooking_time_minutes: recipe.cooking_time_minutes,
      servings: recipe.servings,

      # старые полезные поля
      missing_count: missing_count,
      missing_ingredients: build_missing_ingredients(missing),

      # новые диагностические поля, обычно никому не мешают
      total_ingredients: matched_count + missing_count,
      matched_count: matched_count,
      match_ratio: match_ratio.round(2),
      matched_ingredients: build_matched_ingredients(matched)
    }
  end

  def build_matched_ingredients(recipe_ingredients)
    recipe_ingredients.filter_map do |ri|
      ingredient = ri.ingredient
      next unless ingredient

      {
        ingredient_id: ri.ingredient_id,
        name: ingredient.name,
        amount: ri.amount,
        unit: ri.unit
      }
    end
  end

  def build_missing_ingredients(recipe_ingredients)
    recipe_ingredients.filter_map do |ri|
      ingredient = ri.ingredient
      next unless ingredient

      cheapest = cheapest_product_for(ingredient)

      {
        ingredient_id: ri.ingredient_id,
        name: ingredient.name,
        amount: ri.amount,
        unit: ri.unit,
        cheapest_product: cheapest
      }
    end
  end

  def cheapest_product_for(ingredient)
    product = ingredient.products.min_by(&:price_cents)
    return nil unless product

    {
      name: product.name,
      store: product.store,
      price_cents: product.price_cents,
      url: product.url
    }
  end
end