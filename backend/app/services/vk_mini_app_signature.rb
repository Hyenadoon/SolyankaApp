require "openssl"
require "base64"

class VkMiniAppSignature
  SIGN_PARAM = "sign".freeze

  def initialize(secret: ENV["VK_APP_SECRET"])
    @secret = secret.to_s
  end

  def valid?(params)
    return false if @secret.blank?

    received_sign = params[SIGN_PARAM].to_s
    return false if received_sign.blank?

    secure_compare(received_sign, expected_sign(params))
  end

  def expected_sign(params)
    payload = normalized_payload(params)
    digest = OpenSSL::HMAC.digest("SHA256", @secret, payload)
    Base64.urlsafe_encode64(digest, padding: false)
  end

  private

  def normalized_payload(params)
    params
      .to_h
      .stringify_keys
      .select { |key, value| key.start_with?("vk_") && value.present? }
      .sort_by { |key, _value| key }
      .map { |key, value| "#{key}=#{value}" }
      .join("&")
  end

  def secure_compare(left, right)
    return false unless left.bytesize == right.bytesize

    ActiveSupport::SecurityUtils.secure_compare(left, right)
  end
end
