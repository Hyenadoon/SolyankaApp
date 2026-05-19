Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      scope :auth, controller: :auth do
        post "register"
        post "login"
        get "me"
      end

      scope :vk, controller: :vk do
        post "launch"
        get "config"
      end

      resources :ingredients, only: [] do
        collection do
          get :search
        end
      end

      resources :pantry_items, only: [:index, :create, :destroy]

      resources :recipes, only: [] do
        collection do
          get :recommendations
        end
      end

      resources :cooking_sessions, only: [:create, :show] do
        member do
          patch :finish, to: "cooking_sessions#finish"
        end
        resources :steps, only: [:update], controller: "cooking_steps"
      end

      post "fridge_recognition", to: "fridge_recognition#create"
    end
  end

  get "up", to: proc { [200, {}, ["OK"]] }
end
