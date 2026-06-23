def recipe_entry(json, entry)
  json.recipe_id entry[:recipe_id]
  json.name entry[:name]
  json.description entry[:description]
  json.image_url entry[:image_url]
  json.cooking_time_minutes entry[:cooking_time_minutes]
  json.servings entry[:servings]
  json.ready_to_cook entry[:ready_to_cook]
  json.missing_count entry[:missing_count]
  json.total_ingredients entry[:total_ingredients]
  json.matched_count entry[:matched_count]
  json.match_ratio entry[:match_ratio]

  json.matched_ingredients entry[:matched_ingredients] do |mi|
    json.ingredient_id mi[:ingredient_id]
    json.name mi[:name]
    json.amount mi[:amount]
    json.unit mi[:unit]
    json.pantry_item_id mi[:pantry_item_id]
    json.pantry_amount mi[:pantry_amount]
    json.pantry_unit mi[:pantry_unit]
  end

  json.missing_ingredients entry[:missing_ingredients] do |mi|
    json.ingredient_id mi[:ingredient_id]
    json.name mi[:name]
    json.amount mi[:amount]
    json.unit mi[:unit]
    if mi[:cheapest_product]
      json.cheapest_product do
        json.name mi[:cheapest_product][:name]
        json.store mi[:cheapest_product][:store]
        json.price_cents mi[:cheapest_product][:price_cents]
        json.url mi[:cheapest_product][:url]
      end
    end
  end
end

json.no_buy @no_buy do |entry|
  recipe_entry(json, entry)
end

json.need_buy @need_buy do |entry|
  recipe_entry(json, entry)
end
