# frozen_string_literal: true

# Product recognition logic used by the JSON API controllers.
# The file keeps the historical project name `vision_controller.rb`, but the
# implementation is intentionally a plain module/service: this app is Rails API +
# React, not a Turbo/HTML upload flow.

require "base64"
require "json"
require "net/http"
require "uri"
require Rails.root.join("config/prompts/food_analyzer_prompt")

module VisionController
  ScanItem = Struct.new(:id, :name, :quantity, :unit, :grams, :ingredient, :confidence, keyword_init: true) do
    def matched?
      ingredient.present?
    end
  end

  class RecognitionError < StandardError; end

  class Analyzer
    OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
    DEFAULT_MODEL = "gpt-4.1-mini"
    MAX_IMAGE_SIZE = 12.megabytes
    ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/webp image/heic image/heif].freeze

    def initialize(user:, image:)
      @user = user
      @image = image
    end

    def call
      validate_image!

      image_reference = build_image_reference
      raw_text = analyze_image(image_reference[:url])
      scan_items = parse_scan_result(raw_text)
      matched_items = match_ingredients(scan_items)

      store_fridge_photo(image_reference[:stored_url])

      {
        image_url: image_reference[:stored_url],
        recognized_items: serialize_recognized_items(matched_items),
        suggested_ingredients: serialize_suggested_ingredients(matched_items)
      }
    end

    private

    attr_reader :user, :image

    def validate_image!
      raise RecognitionError, "Пожалуйста, выберите изображение" if image.blank?

      if image.respond_to?(:size) && image.size.to_i > MAX_IMAGE_SIZE
        raise RecognitionError, "Файл слишком большой. Максимум — #{MAX_IMAGE_SIZE / 1.megabyte} МБ"
      end

      content_type = image.respond_to?(:content_type) ? image.content_type.to_s : ""
      return if ALLOWED_CONTENT_TYPES.include?(content_type)

      raise RecognitionError, "Поддерживаются только JPEG, PNG, WEBP, HEIC и HEIF"
    end

    def build_image_reference
      uploaded = try_upload_public_image
      return { url: uploaded[:url], stored_url: uploaded[:url] } if uploaded&.dig(:url).present?

      data_url = build_data_url(image)
      { url: data_url, stored_url: nil }
    end

    def try_upload_public_image
      return nil if ENV["IMGBB_API_KEY"].blank?

      ImageUploaderService.upload(image)
    rescue StandardError => e
      Rails.logger.warn("Image public upload skipped: #{e.class}: #{e.message}")
      rewind_image!
      nil
    end

    def build_data_url(file)
      rewind_image!
      encoded = Base64.strict_encode64(file.read)
      rewind_image!
      "data:#{file.content_type};base64,#{encoded}"
    end

    def analyze_image(image_url)
      api_key = ENV["OPENAI_API_KEY"].to_s
      raise RecognitionError, "OPENAI_API_KEY не задан" if api_key.blank?

      uri = URI(OPENAI_RESPONSES_URL)
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      request.body = JSON.generate(openai_payload(image_url))

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, read_timeout: 90, open_timeout: 15) do |http|
        http.request(request)
      end

      parsed = parse_openai_response(response)
      extract_output_text(parsed).presence || "[]"
    rescue RecognitionError
      raise
    rescue StandardError => e
      Rails.logger.error("OpenAI Vision failed: #{e.class}: #{e.message}")
      raise RecognitionError, "Ошибка анализа изображения: #{e.message}"
    end

    def openai_payload(image_url)
      {
        model: ENV.fetch("OPENAI_VISION_MODEL", DEFAULT_MODEL),
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: FOOD_ANALYZER_PROMPT },
              { type: "input_image", image_url: image_url }
            ]
          }
        ],
        temperature: 0
      }
    end

    def parse_openai_response(response)
      parsed = JSON.parse(response.body)
      return parsed if response.is_a?(Net::HTTPSuccess)

      message = parsed.dig("error", "message") || "HTTP #{response.code}"
      raise RecognitionError, "OpenAI API вернул ошибку: #{message}"
    rescue JSON::ParserError
      raise RecognitionError, "OpenAI API вернул некорректный JSON"
    end

    def extract_output_text(parsed_response)
      return parsed_response["output_text"] if parsed_response["output_text"].present?

      parsed_response.fetch("output", []).filter_map do |entry|
        entry.fetch("content", []).filter_map { |content| content["text"] if content["type"] == "output_text" }
      end.flatten.join("\n")
    end

    def parse_scan_result(raw_text)
      Rails.logger.info("OpenAI raw result: #{raw_text}")

      items = JSON.parse(extract_json(raw_text))
      raise RecognitionError, "Модель вернула не массив JSON" unless items.is_a?(Array)

      items.filter_map.with_index do |item, idx|
        name = item["name"].to_s.strip
        next if name.blank?

        ScanItem.new(
          id: idx + 1,
          name: name,
          quantity: normalize_number(item["quantity"]),
          unit: item["unit"].to_s.strip.presence,
          grams: normalize_number(item["grams"])
        )
      end
    rescue JSON::ParserError
      raise RecognitionError, "Не удалось разобрать JSON ответа модели"
    end

    def extract_json(raw_text)
      text = raw_text.to_s.strip
      fenced = text.match(/```(?:json)?\s*(.*?)\s*```/m)
      return fenced[1].strip if fenced

      first_array = text.index("[")
      last_array = text.rindex("]")
      return text[first_array..last_array] if first_array && last_array && last_array > first_array

      text
    end

    def normalize_number(value)
      return nil if value.nil?
      return value if value.is_a?(Numeric)

      numeric = value.to_s.tr(",", ".").match(/-?\d+(?:\.\d+)?/)&.[](0)
      numeric&.include?(".") ? numeric.to_f : numeric&.to_i
    end

    def match_ingredients(scan_items)
      scan_items.map do |item|
        ingredient, confidence = find_ingredient(item.name)
        item.ingredient = ingredient
        item.confidence = confidence
        item
      end
    end

    def find_ingredient(name)
      normalized = normalize_name(name)
      return [nil, nil] if normalized.blank?

      exact = Ingredient
        .left_joins(:ingredient_synonyms)
        .where("ingredients.normalized_name = :q OR ingredient_synonyms.synonym = :q", q: normalized)
        .first
      return [exact, 0.95] if exact

      partial = Ingredient.search_by_query(normalized).first
      return [partial, 0.72] if partial

      [nil, nil]
    end

    def normalize_name(value)
      value.to_s.strip.downcase.gsub(/[^а-яёa-z0-9\s]/, "").squish
    end

    def serialize_recognized_items(items)
      items.map do |item|
        {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          grams: item.grams,
          ingredient_id: item.ingredient&.id,
          ingredient_name: item.ingredient&.name,
          confidence: item.confidence,
          matched: item.matched?
        }
      end
    end

    def serialize_suggested_ingredients(items)
      items.filter_map do |item|
        next unless item.matched?

        {
          id: item.id,
          ingredient_id: item.ingredient.id,
          name: item.ingredient.name,
          recognized_name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          grams: item.grams,
          confidence: item.confidence,
          matched: true
        }
      end
    end

    def store_fridge_photo(image_url)
      return if image_url.blank? || user.blank?

      user.fridge_photos.create!(image_url: image_url)
    rescue StandardError => e
      Rails.logger.warn("FridgePhoto was not saved: #{e.class}: #{e.message}")
    end

    def rewind_image!
      image.rewind if image.respond_to?(:rewind)
    end
  end
end
