class CreateRecipeIngredients < ActiveRecord::Migration[7.1]
  def change
    create_table :recipe_ingredients do |t|
      t.references :recipe, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.decimal :amount
      t.string :unit
      t.timestamps
    end
    add_index :recipe_ingredients, :ingredient_id, name: "idx_recipe_ingredients_on_ingredient"
  end
end
