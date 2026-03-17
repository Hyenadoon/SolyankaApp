json.no_buy @no_buy do |entry|
  json.recipe_id entry[:recipe_id]
  json.name entry[:name]
  json.description entry[:description]
  json.image_url entry[:image_url]
  json.cooking_time_minutes entry[:cooking_time_minutes]
  json.servings entry[:servings]
  json.missing_ingredients []
end

json.need_buy @need_buy do |entry|
  json.recipe_id entry[:recipe_id]
  json.name entry[:name]
  json.description entry[:description]
  json.image_url entry[:image_url]
  json.cooking_time_minutes entry[:cooking_time_minutes]
  json.servings entry[:servings]
  json.missing_count entry[:missing_count]
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
