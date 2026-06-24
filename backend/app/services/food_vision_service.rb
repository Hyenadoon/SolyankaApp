# app/services/food_vision_service.rb
#
# Sends a publicly reachable image URL to the OpenAI Vision API and returns a
# normalised list of recognised food products. Pure data in / pure data out:
# the controller stays thin and the parsing logic is unit-testable in isolation.

require "openai"
require Rails.root.join("config/prompts/food_analyzer_prompt")

class FoodVisionService
  class AnalysisError < StandardError; end

  DEFAULT_MODEL = "gpt-4.1-mini".freeze

  # Public entry point.
  # @param image_url [String] publicly accessible image URL
  # @return [Array<Hash>] e.g. [{ name:, quantity:, unit:, grams: }, ...]
  def self.analyze(image_url)
    new(image_url).analyze
  end

  def initialize(image_url)
    @image_url = image_url
  end

  def analyze
    raise AnalysisError, "Не передан URL изображения" if @image_url.blank?

    raw_text = request_recognition
    parse(raw_text)
  end

  private

  attr_reader :image_url

  # Calls the OpenAI Responses API with the food-analyzer prompt + the image.
  # Returns the raw model text (expected to be a JSON array string).
  def request_recognition
    response = client.responses.create(
      model: model_name,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: FOOD_ANALYZER_PROMPT },
            { type: "input_image", image_url: image_url }
          ]
        }
      ]
    )

    # Fall back to an empty array so an empty answer is handled as "nothing found"
    response.output_text.presence || "[]"
  rescue StandardError => e
    Rails.logger.error("FoodVisionService OpenAI call failed: #{e.class}: #{e.message}")
    raise AnalysisError, "Ошибка анализа изображения: #{e.message}"
  end

  # Parses the model's JSON into an array of clean, validated product hashes.
  def parse(raw_text)
    Rails.logger.info("FoodVisionService raw result: #{raw_text}")

    items = JSON.parse(strip_code_fences(raw_text))

    unless items.is_a?(Array)
      raise AnalysisError, "Модель вернула не JSON-массив"
    end

    items.filter_map { |item| normalize_item(item) }
  rescue JSON::ParserError
    raise AnalysisError, "Не удалось разобрать ответ модели как JSON"
  end

  # Converts one raw model item into a normalised hash, or nil if it's unusable.
  def normalize_item(item)
    return nil unless item.is_a?(Hash)

    name = item["name"].to_s.strip
    return nil if name.blank?

    {
      name: name,
      quantity: integer_or_nil(item["quantity"]),
      unit: item["unit"].to_s.strip,
      grams: integer_or_nil(item["grams"])
    }
  end

  # Some models wrap JSON in ```json ... ``` fences despite instructions — be defensive.
  def strip_code_fences(text)
    text.to_s.strip.sub(/\A```(?:json)?\s*/i, "").sub(/\s*```\z/, "")
  end

  def integer_or_nil(value)
    Integer(value)
  rescue ArgumentError, TypeError
    nil
  end

  def client
    @client ||= OpenAI::Client.new(api_key: ENV.fetch("OPENAI_API_KEY"))
  rescue KeyError
    raise AnalysisError, "OPENAI_API_KEY не задан"
  end

  def model_name
    ENV.fetch("OPENAI_VISION_MODEL", DEFAULT_MODEL)
  end
end
