class CreateCookingStepProgresses < ActiveRecord::Migration[7.1]
  def change
    create_table :cooking_step_progresses do |t|
      t.references :cooking_session, null: false, foreign_key: true
      t.references :recipe_step, null: false, foreign_key: true
      t.boolean :completed, default: false, null: false
      t.datetime :completed_at
      t.timestamps
    end
  end
end
