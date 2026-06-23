class CreateIngredientSynonyms < ActiveRecord::Migration[7.1]
  def change
    create_table :ingredient_synonyms do |t|
      t.references :ingredient, null: false, foreign_key: true
      t.string :synonym, null: false
      t.timestamps
    end
    add_index :ingredient_synonyms, :synonym
  end
end
