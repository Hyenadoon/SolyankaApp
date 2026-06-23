# app/models/scan_item.rb
class ScanItem
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :id, :integer
  attribute :name, :string
  attribute :quantity, :integer
  attribute :unit, :string
  attribute :grams, :integer
end