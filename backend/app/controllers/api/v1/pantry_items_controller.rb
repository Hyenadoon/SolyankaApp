module Api
  module V1
    class PantryItemsController < ApplicationController
      def index
        @pantry_items = current_user.pantry_items.includes(:ingredient)
      end

      def create
        @pantry_item = current_user.pantry_items.new(pantry_item_params)
        if @pantry_item.save
          render :show, status: :created
        else
          if @pantry_item.errors[:ingredient_id]&.any? { |e| e.include?("холодильнике") }
            render json: { error: "Ингредиент уже в холодильнике" }, status: :conflict
          else
            render json: { errors: @pantry_item.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      def destroy
        pantry_item = current_user.pantry_items.find(params[:id])
        pantry_item.destroy!
        head :no_content
      end

      private

      def pantry_item_params
        params.permit(:ingredient_id, :amount, :unit)
      end
    end
  end
end
