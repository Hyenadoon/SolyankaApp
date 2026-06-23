class RecipeRecommender
  DEFAULT_MAX_MISSING = 3

  def initialize(user, max_missing = nil, min_match_ratio: nil, **kwargs)
    @user = user
    @max_missing = normalize_limit(max_missing || kwargs[:max_missing])
    @min_match_ratio = normalize_ratio(min_match_ratio || kwargs[:min_match_ratio])
  end

  def call
    pantry_index = build_pantry_index
    no_buy = []
    need_buy = []

    recipes_with_ingredients.each do |recipe|
      recipe_ingredients = recipe.recipe_ingredients
      total = recipe_ingredients.size
      next if total == 0

      matched = []
      missing = []

      recipe_ingredients.each do |recipe_ingredient|
        pantry_item = pantry_index[recipe_ingredient.ingredient_id]
        if pantry_item
          matched << [recipe_ingredient, pantry_item]
        else
          missing << recipe_ingredient
        end
      end

      matched_count = matched.size
      next if matched_count == 0

      missing_count = missing.size
      match_ratio = matched_count.to_f / total
      next if @min_match_ratio && match_ratio < @min_match_ratio
      next if @max_missing && missing_count.positive? && missing_count > @max_missing

      entry = build_entry(
        recipe,
        matched,
        missing,
        matched_count,
        missing_count,
        match_ratio
      )

      if missing_count.zero?
        no_buy << entry
      else
        need_buy << entry
      end
    end

    sort_entries!(no_buy)
    sort_entries!(need_buy)

    {
      no_buy: no_buy,
      need_buy: need_buy,
      pantry_ingredient_ids: pantry_index.keys
    }
  end

  private

  def normalize_limit(value)
    return DEFAULT_MAX_MISSING if value.nil?

    value.to_i.clamp(0, 99)
  end

  def normalize_ratio(value)
    return nil if value.nil?

    ratio = value.to_f
    return nil if ratio <= 0

    [ratio, 1.0].min
  end

  def build_pantry_index
    @user
      .pantry_items
      .includes(:ingredient)
      .where.not(ingredient_id: nil)
      .index_by(&:ingredient_id)
  end

  def recipes_with_ingredients
    Recipe.includes(recipe_ingredients: { ingredient: :products }).all
  end

  def sort_entries!(entries)
    entries.sort_by! do |entry|
      [
        entry[:missing_count],
        -entry[:match_ratio],
        -entry[:matched_count],
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
      missing_count: missing_count,
      missing_ingredients: build_missing_ingredients(missing),
      total_ingredients: matched_count + missing_count,
      matched_count: matched_count,
      match_ratio: match_ratio.round(2),
      matched_ingredients: build_matched_ingredients(matched),
      ready_to_cook: missing_count.zero?
    }
  end

  def build_matched_ingredients(pairs)
    pairs.filter_map do |ri, pantry_item|
      ingredient = ri.ingredient
      next unless ingredient

      {
        ingredient_id: ri.ingredient_id,
        name: ingredient.name,
        amount: ri.amount,
        unit: ri.unit,
        pantry_item_id: pantry_item.id,
        pantry_amount: pantry_item.amount,
        pantry_unit: pantry_item.unit
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
