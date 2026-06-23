# frozen_string_literal: true

module Api
  module V1
    class FridgeRecognitionController < ApplicationController
      def create
        result = ::VisionController::Analyzer.new(
          user: current_user,
          image: params[:image]
        ).call

        render json: result, status: :ok
      rescue ::VisionController::RecognitionError => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue StandardError => e
        Rails.logger.error("Fridge recognition failed: #{e.class}: #{e.message}")
        render json: { error: "Не удалось распознать продукты" }, status: :internal_server_error
      end
    end
  end
end
