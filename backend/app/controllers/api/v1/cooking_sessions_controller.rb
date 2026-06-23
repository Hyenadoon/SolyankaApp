module Api
  module V1
    class CookingSessionsController < ApplicationController
      def create
        recipe = Recipe.find(params[:recipe_id])
        @session = current_user.cooking_sessions.create!(
          recipe: recipe,
          status: :started,
          started_at: Time.current
        )

        recipe.recipe_steps.each do |step|
          @session.cooking_step_progresses.create!(
            recipe_step: step,
            completed: false
          )
        end

        render :show, status: :created
      end

      def show
        @session = current_user.cooking_sessions
          .includes(cooking_step_progresses: :recipe_step, recipe: :recipe_steps)
          .find(params[:id])
      end

      def finish
        @session = current_user.cooking_sessions.find(params[:id])
        @session.finish!
        render :show
      end
    end
  end
end
