class CreateFridgePhotos < ActiveRecord::Migration[7.1]
  def change
    create_table :fridge_photos do |t|
      t.references :user, null: false, foreign_key: true
      t.string :image_url
      t.timestamps
    end
  end
end
