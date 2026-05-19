class AddVkIdentityToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :vk_user_id, :string
    add_index :users, :vk_user_id, unique: true
  end
end
