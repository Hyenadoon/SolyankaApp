class User < ApplicationRecord
  has_secure_password

  has_many :pantry_items, dependent: :destroy
  has_many :cooking_sessions, dependent: :destroy
  has_many :fridge_photos, dependent: :destroy

  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
end
