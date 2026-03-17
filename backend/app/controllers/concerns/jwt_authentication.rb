module JwtAuthentication
  extend ActiveSupport::Concern

  SECRET_KEY = ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }
  TOKEN_LIFETIME = 7.days

  included do
    before_action :authenticate_user!
  end

  class_methods do
    def skip_authentication(*actions)
      skip_before_action :authenticate_user!, only: actions
    end
  end

  def current_user
    @current_user
  end

  def authenticate_user!
    token = extract_token
    payload = decode_token(token)
    @current_user = User.find(payload["user_id"])
  rescue ActiveRecord::RecordNotFound, JWT::DecodeError, JWT::ExpiredSignature
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def encode_token(user)
    payload = {
      user_id: user.id,
      exp: TOKEN_LIFETIME.from_now.to_i
    }
    JWT.encode(payload, SECRET_KEY, "HS256")
  end

  private

  def extract_token
    header = request.headers["Authorization"]
    header&.split(" ")&.last
  end

  def decode_token(token)
    JWT.decode(token, SECRET_KEY, true, algorithm: "HS256").first
  end
end
