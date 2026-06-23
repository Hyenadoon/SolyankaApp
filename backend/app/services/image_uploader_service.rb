# app/services/image_uploader_service.rb

require "net/http"
require "uri"
require "json"
require "base64"

class ImageUploaderService
  IMGBB_API_URL = "https://api.imgbb.com/1/upload".freeze
  IMAGE_EXPIRATION_SECONDS = 600 # 10 minutes

  class UploadError < StandardError; end

  def self.upload(file)
    new(file).upload
  end

  def initialize(file)
    @file = file
  end

  def upload
    validate_file!
    validate_api_key!

    response = send_upload_request
    parsed_response = parse_response(response)

    build_result(parsed_response)
  rescue StandardError => e
    Rails.logger.error("ImageUploaderService error: #{e.class}: #{e.message}")
    raise
  end

  private

  attr_reader :file

  # Checks that a file was actually passed to the service
  def validate_file!
    raise ArgumentError, "Файл не передан" unless file.present?
  end

  # Checks that imgBB API key exists in environment variables
  def validate_api_key!
    raise UploadError, "IMGBB_API_KEY не задан" unless api_key.present?
  end

  # Reads uploaded file and encodes it in Base64 for imgBB API
  def encoded_image
    @encoded_image ||= Base64.strict_encode64(file.read)
  end

  # Sends POST request to imgBB
  def send_upload_request
    Net::HTTP.post_form(upload_uri, image: encoded_image)
  end

  # Builds upload URL with API key and temporary image expiration
  def upload_uri
    URI(IMGBB_API_URL).tap do |uri|
      uri.query = URI.encode_www_form(
        key: api_key,
        expiration: IMAGE_EXPIRATION_SECONDS
      )
    end
  end

  # Parses JSON response from imgBB
  def parse_response(response)
    JSON.parse(response.body)
  rescue JSON::ParserError
    raise UploadError, "imgBB вернул некорректный JSON"
  end

  # Converts successful imgBB response into a small app-friendly hash
  def build_result(parsed_response)
    unless parsed_response["success"]
      raise UploadError, imgbb_error_message(parsed_response)
    end

    {
      url: parsed_response.dig("data", "url"),
      delete_url: parsed_response.dig("data", "delete_url")
    }
  end

  # Extracts readable error message from imgBB response
  def imgbb_error_message(parsed_response)
    message = parsed_response.dig("error", "message") || "неизвестная ошибка"
    "Ошибка imgBB: #{message}"
  end

  # Reads API key lazily from ENV
  def api_key
    @api_key ||= ENV["IMGBB_API_KEY"]
  end
end
