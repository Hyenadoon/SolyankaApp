json.array! @pantry_items do |item|
  json.id item.id
  json.ingredient_id item.ingredient_id
  json.ingredient_name item.ingredient.name
  json.ingredient_image_url item.ingredient.image_url
  json.amount item.amount
  json.unit item.unit
  json.created_at item.created_at
end
