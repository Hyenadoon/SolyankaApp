class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.references :ingredient, null: false, foreign_key: true
      t.string :name, null: false
      t.string :store
      t.integer :price_cents
      t.string :url
      t.timestamps
    end
  end
end
