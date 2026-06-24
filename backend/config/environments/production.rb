require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.force_ssl = true
  stdout_logger = ActiveSupport::Logger.new($stdout)
  stdout_logger.formatter = Logger::Formatter.new
  config.logger = ActiveSupport::TaggedLogging.new(stdout_logger)
  config.log_tags = [:request_id]
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")
  config.active_record.dump_schema_after_migration = false
  config.active_support.report_deprecations = false
end
