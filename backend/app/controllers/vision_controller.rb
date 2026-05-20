# app/controllers/vision_controller.rb

require "openai"
require Rails.root.join("config/prompts/food_analyzer_prompt")

# structure for ONE product from the image, as returned by the model
ScanItem = Struct.new(:id, :name, :quantity, :unit, :grams, keyword_init: true)

class VisionController < ApplicationController
  def new
    # simple upload page, no additional logic needed
  end

  def analyze
    # validating that the user actually uploaded an image
    return redirect_with_alert("Пожалуйста, выберите изображение") if params[:image].blank?

    # uploading image and getting a public URL for OpenAI Vision
    image_url = upload_image(params[:image])
    return redirect_to new_vision_path unless image_url

    # sending the image to OpenAI Vision for analysis
    raw_text = analyze_image(image_url)

    # parsing model response into structured ScanItem objects
    @result = parse_scan_result(raw_text)

    respond_to do |format|
      format.html { render :new }

      # turbo stream response for dynamic frontend updates
      format.turbo_stream do
        render partial: "results", locals: { result: @result }
      end
    end
  end

  private

  # uploads image using ImageUploaderService
  # returns public image URL or nil on failure
  def upload_image(file)
    uploaded = ImageUploaderService.upload(file)
    uploaded[:url]

  rescue StandardError => e
    Rails.logger.error "Image upload failed: #{e.message}"

    flash[:alert] = "Ошибка при загрузке изображения: #{e.message}"
    nil
  end

  # sends image to OpenAI Vision API and returns raw text response
  def analyze_image(image_url)
    client = OpenAI::Client.new(
      api_key: ENV.fetch("OPENAI_API_KEY")
    )

    response = client.responses.create(
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            # prompt describing expected JSON output structure
            { type: "input_text", text: FOOD_ANALYZER_PROMPT },

            # uploaded image URL for vision analysis
            { type: "input_image", image_url: image_url }
          ]
        }
      ]
    )

    # fallback to empty JSON array if model returned nothing
    response.output_text.presence || "[]"

  rescue StandardError => e
    Rails.logger.error "OpenAI Vision failed: #{e.message}"

    raise "Ошибка анализа изображения: #{e.message}"
  end

  # parses raw JSON returned by the model
  # converts each item into ScanItem structure
  def parse_scan_result(raw_text)
    # logging raw response for debugging and prompt tuning
    Rails.logger.info "OpenAI raw result: #{raw_text}"

    items = JSON.parse(raw_text)

    # validating that the response is actually an array
    unless items.is_a?(Array)
      return error_result("Модель вернула не массив JSON: #{raw_text}")
    end

    items.map.with_index do |item, idx|
      ScanItem.new(
        id: idx,
        name: item["name"].to_s.strip,
        quantity: item["quantity"],
        unit: item["unit"].to_s.strip,
        grams: item["grams"]
      )
    end

  rescue JSON::ParserError
    error_result("Не удалось разобрать JSON. Ответ модели: #{raw_text}")

  rescue StandardError => e
    Rails.logger.error "Vision parse failed: #{e.message}"

    error_result("Ошибка: #{e.message}")
  end

  # unified error response structure
  def error_result(message)
    [{ "error" => message }]
  end

  # helper for redirect + flash alert
  def redirect_with_alert(message)
    flash[:alert] = message
    redirect_to new_vision_path
  end
end












