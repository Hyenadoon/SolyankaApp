class CreateCookingSessions < ActiveRecord::Migration[7.1]
  def change
    create_table :cooking_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :recipe, null: false, foreign_key: true
      t.string :status, null: false, default: "started"
      t.datetime :started_at
      t.datetime :finished_at
      t.timestamps
    end
  end
end
