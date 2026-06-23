module Api
  module V1
    class PantryItemsController < ApplicationController
      def index
        @pantry_items = current_user.pantry_items.includes(:ingredient)
      end

      def create
        existing = current_user.pantry_items.find_by(ingredient_id: pantry_item_params[:ingredient_id])

        if existing
          existing.assign_attributes(upsert_pantry_item_params(existing))
          @pantry_item = existing
          if @pantry_item.save
            render :show, status: :ok
          else
            render json: { errors: @pantry_item.errors.full_messages }, status: :unprocessable_entity
          end
          return
        end

        @pantry_item = current_user.pantry_items.new(pantry_item_params)
        if @pantry_item.save
          render :show, status: :created
        else
          render json: { errors: @pantry_item.errors.full_messages }, status: :unprocessable_entity
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

      def upsert_pantry_item_params(existing)
        permitted = pantry_item_params.to_h.symbolize_keys.slice(:amount, :unit)
        permitted[:amount] = existing.amount if permitted[:amount].nil?
        permitted[:unit] = existing.unit if permitted[:unit].blank?
        permitted
      end
    end
  end
end
