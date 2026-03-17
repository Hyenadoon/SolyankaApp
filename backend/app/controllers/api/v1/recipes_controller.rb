module Api
  module V1
    class RecipesController < ApplicationController
      def recommendations
        max_missing = (params[:max_missing] || 3).to_i
        result = RecipeRecommender.new(current_user, max_missing: max_missing).call

        @no_buy = result[:no_buy]
        @need_buy = result[:need_buy]
      end
    end
  end
end
