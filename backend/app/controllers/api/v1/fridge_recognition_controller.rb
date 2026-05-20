#placeholder

module Api
  module V1
    class FridgeRecognitionController < ApplicationController
      
      COMMON_CATEGORIES = %w[яйца молоко сыр помидоры огурцы зелень масло хлеб лук чеснок морковь картофель].freeze

      def create
    
        suggested = COMMON_CATEGORIES.filter_map do |category|
          ingredient = Ingredient.where("normalized_name LIKE ?", "%#{category}%").first
          next unless ingredient
          { ingredient_id: ingredient.id, name: ingredient.name, confidence: 0.7 }
        end

        render json: { suggested_ingredients: suggested }
      end
    end
  end
end
