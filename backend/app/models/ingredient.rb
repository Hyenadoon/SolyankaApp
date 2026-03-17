class Ingredient < ApplicationRecord
  has_many :ingredient_synonyms, dependent: :destroy
  has_many :recipe_ingredients, dependent: :destroy
  has_many :recipes, through: :recipe_ingredients
  has_many :products, dependent: :destroy
  has_many :pantry_items, dependent: :destroy

  validates :name, presence: true
  validates :normalized_name, presence: true

  before_validation :set_normalized_name

  scope :search_by_query, ->(q) {
    normalized = q.to_s.strip.downcase
    return none if normalized.blank?

    left_joins(:ingredient_synonyms)
      .where(
        "ingredients.normalized_name LIKE :q OR ingredient_synonyms.synonym LIKE :q",
        q: "%#{normalized}%"
      )
      .distinct
      .limit(20)
  }

  private

  def set_normalized_name
    self.normalized_name = name.to_s.strip.downcase.gsub(/[^а-яёa-z0-9\s]/, "").squish if normalized_name.blank?
  end
end
