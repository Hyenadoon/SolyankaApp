# app/services/image_uploader_service.rb
require 'net/http'
require 'uri'
require 'json'
require 'base64'

class ImageUploaderService
  IMGBB_API_URL = "https://api.imgbb.com/1/upload".freeze

  def self.upload(file)
    raise ArgumentError, "Файл не передан" unless file.present?

    api_key = ENV["IMGBB_API_KEY"]
    raise "IMGBB_API_KEY не задан" unless api_key.present?

    # Читаем файл и кодируем в base64
    image_data = Base64.strict_encode64(file.read)

    uri = URI("#{IMGBB_API_URL}?key=#{api_key}&expiration=600") # 10 минут
    response = Net::HTTP.post_form(uri, { 'image' => image_data })

    parsed = JSON.parse(response.body)
    if parsed["success"]
      {
        url: parsed.dig("data", "url"),
        delete_url: parsed.dig("data", "delete_url")
      }
    else
      raise "Ошибка imgBB: #{parsed['error']&.dig('message') || 'неизвестная'}"
    end
  rescue => e
    Rails.logger.error("ImageUploaderService error: #{e.message}")
    raise
  end
end
