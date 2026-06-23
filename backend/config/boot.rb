# Load local .env files without adding an extra gem.
# Existing real environment variables win over values from files.
def load_local_env_file(path)
  return unless File.file?(path)

  File.foreach(path) do |line|
    stripped = line.strip
    next if stripped.empty? || stripped.start_with?("#")
    next unless stripped.include?("=")

    key, value = stripped.split("=", 2)
    key = key.strip
    next if key.empty? || ENV.key?(key)

    value = value.to_s.strip
    value = value[1...-1] if value.length >= 2 && ((value.start_with?("'") && value.end_with?("'")) || (value.start_with?("\"") && value.end_with?("\"")))
    ENV[key] = value
  end
end

load_local_env_file(File.expand_path("../../.env", __dir__))
load_local_env_file(File.expand_path("../.env", __dir__))

ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup"
require "bootsnap/setup"
