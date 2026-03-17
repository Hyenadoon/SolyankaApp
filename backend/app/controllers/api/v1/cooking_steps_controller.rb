module Api
  module V1
    class CookingStepsController < ApplicationController
      def update
        session = current_user.cooking_sessions.find(params[:cooking_session_id])
        progress = session.cooking_step_progresses.find_by!(recipe_step_id: params[:id])

        completed = ActiveModel::Type::Boolean.new.cast(params[:completed])
        progress.update!(
          completed: completed,
          completed_at: completed ? Time.current : nil
        )

        render json: {
          id: progress.id,
          recipe_step_id: progress.recipe_step_id,
          completed: progress.completed,
          completed_at: progress.completed_at
        }
      end
    end
  end
end
