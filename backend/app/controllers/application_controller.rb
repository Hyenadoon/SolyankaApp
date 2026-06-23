class ApplicationController < ActionController::API
  include JwtAuthentication  # include the module for JWT authentication
end
