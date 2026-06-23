class CreateRecipes < ActiveRecord::Migration[7.1]
  def change
    create_table :recipes do |t|
      t.string :name, null: false
      t.text :description
      t.string :image_url
      t.integer :cooking_time_minutes
      t.integer :steps_count
      t.integer :servings
      t.timestamps
    end
  end
end
