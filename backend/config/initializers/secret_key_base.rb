Rails.application.config.secret_key_base = ENV.fetch("SECRET_KEY_BASE") {
  "dev_secret_key_base_solyanka_2024_change_in_production_please"
}
