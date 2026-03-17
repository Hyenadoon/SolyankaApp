class RecipeStep < ApplicationRecord
  belongs_to :recipe

  validates :position, presence: true
  validates :description, presence: true
end
