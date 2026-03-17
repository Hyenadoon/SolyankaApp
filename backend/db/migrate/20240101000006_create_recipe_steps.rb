class CreateRecipeSteps < ActiveRecord::Migration[7.1]
  def change
    create_table :recipe_steps do |t|
      t.references :recipe, null: false, foreign_key: true
      t.integer :position, null: false
      t.string :title
      t.text :description, null: false
      t.integer :estimated_minutes
      t.timestamps
    end
  end
end
