class Recipe < ApplicationRecord
  has_many :recipe_ingredients, dependent: :destroy
  has_many :ingredients, through: :recipe_ingredients
  has_many :recipe_steps, -> { order(:position) }, dependent: :destroy
  has_many :cooking_sessions, dependent: :destroy

  validates :name, presence: true
end
