module Api
  module V1
    class AuthController < ApplicationController
      skip_authentication :register, :login

      def register
        user = User.new(user_params)
        if user.save
          token = encode_token(user)
          render json: { access_token: token }, status: :created
        else
          if user.errors[:email]&.include?("has already been taken")
            render json: { error: "Email уже существует" }, status: :unprocessable_entity
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          token = encode_token(user)
          render json: { access_token: token }
        else
          render json: { error: "Неверный логин или пароль" }, status: :unauthorized
        end
      end

      def me
        render json: {
          id: current_user.id,
          email: current_user.email,
          created_at: current_user.created_at
        }
      end

      private

      def user_params
        params.permit(:email, :password)
      end
    end
  end
end
