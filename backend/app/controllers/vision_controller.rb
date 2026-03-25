# app/controllers/vision_controller.rb

# Структура для одной позиции продукта
ScanItem = Struct.new(:id, :name, :quantity, :unit, :grams, keyword_init: true)

class VisionController < ApplicationController
  require "openai"
  require Rails.root.join("config/prompts/food_analyzer_prompt")

  def new
    # простая форма для загрузки файла
  end

  def analyze
    file = params[:image]

    if file.blank?
      flash[:alert] = "Пожалуйста, выберите изображение"
      return redirect_to new_vision_path
    end

    # 1️⃣ Загружаем изображение на imgBB
    begin
      uploaded = ImageUploaderService.upload(file)
      image_url = uploaded[:url]
    rescue => e
      flash[:alert] = "Ошибка при загрузке изображения: #{e.message}"
      return redirect_to new_vision_path
    end

    # 2️⃣ Анализ через OpenAI Vision
    client = OpenAI::Client.new(api_key: ENV["OPENAI_API_KEY"])

    begin
      response = client.responses.create(
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: FOOD_ANALYZER_PROMPT },
              { type: "input_image", image_url: image_url }
            ]
          }
        ]
      )

      raw_text = response.output_text || "[]"
      Rails.logger.info "OpenAI raw result: #{raw_text}"

      # 3️⃣ Парсим JSON и создаём объекты ScanItem
      raw_items = JSON.parse(raw_text)
      @result = raw_items.map.with_index do |item, idx|
        ScanItem.new(
          id: idx,
          name: item["name"],
          quantity: item["quantity"],
          unit: item["unit"],
          grams: item["grams"]
        )
      end

    rescue JSON::ParserError
      @result = [{ "error" => "Не удалось разобрать JSON. Ответ модели: #{raw_text}" }]
    rescue => e
      @result = [{ "error" => "Ошибка: #{e.message}" }]
      Rails.logger.error "Ошибка VisionController: #{e.message}"
    end

    respond_to do |format|
      format.html { render :new }
      format.turbo_stream { render partial: "results", locals: { result: @result } } # Turbo Stream
    end
  end
end












