module Api
  module V1
    class IngredientsController < ApplicationController
      def search
        @ingredients = Ingredient.search_by_query(params[:q])
      end
    end
  end
end
