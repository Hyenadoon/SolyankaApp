class IngredientSynonym < ApplicationRecord
  belongs_to :ingredient

  validates :synonym, presence: true

  before_validation { self.synonym = synonym.to_s.strip.downcase }
end
