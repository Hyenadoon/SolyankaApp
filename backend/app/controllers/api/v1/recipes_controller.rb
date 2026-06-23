module Api
  module V1
    class RecipesController < ApplicationController
      def recommendations
        max_missing = params.fetch(:max_missing, RecipeRecommender::DEFAULT_MAX_MISSING).to_i
        min_match_ratio = params[:min_match_ratio].presence&.to_f
        result = RecipeRecommender.new(
          current_user,
          max_missing: max_missing,
          min_match_ratio: min_match_ratio
        ).call

        @no_buy = result[:no_buy]
        @need_buy = result[:need_buy]
      end
    end
  end
end
