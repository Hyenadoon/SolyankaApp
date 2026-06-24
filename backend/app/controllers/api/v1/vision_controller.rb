# app/controllers/api/v1/vision_controller.rb
#
# Recognises food products on a user-uploaded photo via the OpenAI Vision API
# and maps each recognised product to a catalog Ingredient so the frontend can
# add them straight to the pantry.
#
# Flow: multipart image -> imgBB (public URL) -> OpenAI Vision -> ingredient match.

module Api
  module V1
    class VisionController < ApplicationController
      # POST /api/v1/vision/analyze  (multipart/form-data, field: image)
      def analyze
        return render_error("Пожалуйста, выберите изображение", :unprocessable_entity) if params[:image].blank?

        image_url = upload_image(params[:image])
        recognized = FoodVisionService.analyze(image_url)

        @suggested = build_suggestions(recognized)
        render :analyze
      rescue ImageUploaderService::UploadError => e
        render_error("Не удалось загрузить изображение: #{e.message}", :bad_gateway)
      rescue FoodVisionService::AnalysisError => e
        render_error(e.message, :bad_gateway)
      end

      private

      # Uploads the file and returns a public URL. Any upload failure (imgBB
      # error, network issue, missing key) is normalised to UploadError so the
      # action can answer with a single, clean 502.
      def upload_image(file)
        result = ImageUploaderService.upload(file)
        url = result[:url]
        raise ImageUploaderService::UploadError, "пустой ответ хранилища" if url.blank?

        url
      rescue ImageUploaderService::UploadError
        raise
      rescue StandardError => e
        raise ImageUploaderService::UploadError, e.message
      end

      # Maps recognised free-text products onto catalog ingredients.
      # Matched items sharing the same ingredient are merged; unmatched items are
      # kept (with ingredient_id: nil) so the user still sees what was detected.
      def build_suggestions(recognized)
        matched = {}
        unmatched = []

        recognized.each do |item|
          ingredient = match_ingredient(item[:name])

          if ingredient
            merge_match(matched, ingredient, item)
          else
            unmatched << suggestion_for(nil, item)
          end
        end

        matched.values + unmatched
      end

      def match_ingredient(name)
        Ingredient.search_by_query(name).first
      end

      def merge_match(matched, ingredient, item)
        existing = matched[ingredient.id]

        if existing
          existing[:grams]    = sum(existing[:grams], item[:grams])
          existing[:quantity] = sum(existing[:quantity], item[:quantity])
        else
          matched[ingredient.id] = suggestion_for(ingredient, item)
        end
      end

      def suggestion_for(ingredient, item)
        {
          ingredient_id: ingredient&.id,
          name: ingredient&.name || item[:name],
          recognized_name: item[:name],
          matched: ingredient.present?,
          quantity: item[:quantity],
          unit: item[:unit].presence,
          grams: item[:grams],
          image_url: ingredient&.image_url
        }
      end

      def sum(a, b)
        return b if a.nil?
        return a if b.nil?

        a + b
      end

      def render_error(message, status)
        render json: { error: message }, status: status
      end
    end
  end
end
