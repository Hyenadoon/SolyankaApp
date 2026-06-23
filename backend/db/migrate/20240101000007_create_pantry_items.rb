class CreatePantryItems < ActiveRecord::Migration[7.1]
  def change
    create_table :pantry_items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.decimal :amount
      t.string :unit
      t.timestamps
    end
    add_index :pantry_items, [:user_id, :ingredient_id], unique: true
  end
end
