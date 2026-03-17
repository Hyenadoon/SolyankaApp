class CookingStepProgress < ApplicationRecord
  belongs_to :cooking_session
  belongs_to :recipe_step
end
