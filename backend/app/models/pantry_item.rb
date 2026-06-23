class PantryItem < ApplicationRecord
  belongs_to :user
  belongs_to :ingredient

  validates :ingredient_id, uniqueness: { scope: :user_id, message: "уже в холодильнике" }
  validates :amount, numericality: { greater_than: 0 }, allow_nil: true
end
