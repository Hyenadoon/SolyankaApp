require "securerandom"

module Api
  module V1
    class VkController < ApplicationController
      skip_authentication :launch, :config

      def launch
        launch_params = normalized_launch_params

        unless vk_signature_valid?(launch_params)
          return render json: { error: "Invalid VK launch signature" }, status: :unauthorized
        end

        vk_user_id = launch_params["vk_user_id"].to_s
        if vk_user_id.blank?
          return render json: { error: "vk_user_id is required" }, status: :unprocessable_entity
        end

        user = find_or_create_vk_user(vk_user_id)
        render json: auth_payload(user, launch_params)
      end

      def config
        render json: {
          app_id: ENV["VK_APP_ID"],
          api_version: "5.199",
          supports: {
            launch_params: true,
            signed_auth: true,
            bridge_storage: true,
            external_frontend: true
          },
          required_launch_params: %w[vk_app_id vk_user_id vk_platform sign]
        }
      end

      private

      def normalized_launch_params
        raw_params = params[:launch_params].presence || params[:vk].presence || params
        raw_params = Rack::Utils.parse_nested_query(raw_params) if raw_params.is_a?(String)
        raw_params.to_unsafe_h.stringify_keys.except("controller", "action", "format")
      end

      def vk_signature_valid?(launch_params)
        return true if Rails.env.development? && ActiveModel::Type::Boolean.new.cast(ENV["VK_SKIP_SIGNATURE_CHECK"])

        VkMiniAppSignature.new.valid?(launch_params)
      end

      def find_or_create_vk_user(vk_user_id)
        User.find_or_create_by!(vk_user_id: vk_user_id) do |user|
          user.email = "vk_#{vk_user_id}@vk-miniapp.local"
          user.password = SecureRandom.hex(24)
        end
      end

      def auth_payload(user, launch_params)
        {
          access_token: encode_token(user),
          user: {
            id: user.id,
            email: user.email,
            vk_user_id: user.vk_user_id,
            created_at: user.created_at
          },
          vk: {
            app_id: launch_params["vk_app_id"],
            user_id: launch_params["vk_user_id"],
            platform: launch_params["vk_platform"],
            language: launch_params["vk_language"],
            is_app_user: launch_params["vk_is_app_user"]
          }
        }
      end
    end
  end
end
