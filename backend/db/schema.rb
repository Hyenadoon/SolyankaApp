# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_19_000100) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "cooking_sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "recipe_id", null: false
    t.string "status", default: "started", null: false
    t.datetime "started_at"
    t.datetime "finished_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_id"], name: "index_cooking_sessions_on_recipe_id"
    t.index ["user_id"], name: "index_cooking_sessions_on_user_id"
  end

  create_table "cooking_step_progresses", force: :cascade do |t|
    t.bigint "cooking_session_id", null: false
    t.bigint "recipe_step_id", null: false
    t.boolean "completed", default: false, null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cooking_session_id"], name: "index_cooking_step_progresses_on_cooking_session_id"
    t.index ["recipe_step_id"], name: "index_cooking_step_progresses_on_recipe_step_id"
  end

  create_table "fridge_photos", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_fridge_photos_on_user_id"
  end

  create_table "ingredient_synonyms", force: :cascade do |t|
    t.bigint "ingredient_id", null: false
    t.string "synonym", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_ingredient_synonyms_on_ingredient_id"
    t.index ["synonym"], name: "index_ingredient_synonyms_on_synonym"
  end

  create_table "ingredients", force: :cascade do |t|
    t.string "name", null: false
    t.string "normalized_name", null: false
    t.string "category"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["normalized_name"], name: "index_ingredients_on_normalized_name"
  end

  create_table "pantry_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "ingredient_id", null: false
    t.decimal "amount"
    t.string "unit"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_pantry_items_on_ingredient_id"
    t.index ["user_id", "ingredient_id"], name: "index_pantry_items_on_user_id_and_ingredient_id", unique: true
    t.index ["user_id"], name: "index_pantry_items_on_user_id"
  end

  create_table "products", force: :cascade do |t|
    t.bigint "ingredient_id", null: false
    t.string "name", null: false
    t.string "store"
    t.integer "price_cents"
    t.string "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_products_on_ingredient_id"
  end

  create_table "recipe_ingredients", force: :cascade do |t|
    t.bigint "recipe_id", null: false
    t.bigint "ingredient_id", null: false
    t.decimal "amount"
    t.string "unit"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "idx_recipe_ingredients_on_ingredient"
    t.index ["ingredient_id"], name: "index_recipe_ingredients_on_ingredient_id"
    t.index ["recipe_id"], name: "index_recipe_ingredients_on_recipe_id"
  end

  create_table "recipe_steps", force: :cascade do |t|
    t.bigint "recipe_id", null: false
    t.integer "position", null: false
    t.string "title"
    t.text "description", null: false
    t.integer "estimated_minutes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_id"], name: "index_recipe_steps_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "image_url"
    t.integer "cooking_time_minutes"
    t.integer "steps_count"
    t.integer "servings"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.boolean "email_confirmed", default: false
    t.string "vk_user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["vk_user_id"], name: "index_users_on_vk_user_id", unique: true
  end

  add_foreign_key "cooking_sessions", "recipes"
  add_foreign_key "cooking_sessions", "users"
  add_foreign_key "cooking_step_progresses", "cooking_sessions"
  add_foreign_key "cooking_step_progresses", "recipe_steps"
  add_foreign_key "fridge_photos", "users"
  add_foreign_key "ingredient_synonyms", "ingredients"
  add_foreign_key "pantry_items", "ingredients"
  add_foreign_key "pantry_items", "users"
  add_foreign_key "products", "ingredients"
  add_foreign_key "recipe_ingredients", "ingredients"
  add_foreign_key "recipe_ingredients", "recipes"
  add_foreign_key "recipe_steps", "recipes"
end
