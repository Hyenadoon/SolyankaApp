class Product < ApplicationRecord
  belongs_to :ingredient

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than: 0 }, allow_nil: true
end
