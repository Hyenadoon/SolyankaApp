require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module Solyanka
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.time_zone = "Moscow"

    config.generators do |g|
      g.orm :active_record, primary_key_type: :bigint
    end
  end
end
