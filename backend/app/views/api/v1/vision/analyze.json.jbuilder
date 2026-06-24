json.suggested_ingredients @suggested do |item|
  json.ingredient_id item[:ingredient_id]
  json.name item[:name]
  json.recognized_name item[:recognized_name]
  json.matched item[:matched]
  json.quantity item[:quantity]
  json.unit item[:unit]
  json.grams item[:grams]
  json.image_url item[:image_url]
end
