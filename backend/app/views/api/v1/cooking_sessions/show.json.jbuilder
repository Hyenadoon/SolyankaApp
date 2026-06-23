json.id @session.id
json.recipe_id @session.recipe_id
json.recipe_name @session.recipe.name
json.status @session.status
json.started_at @session.started_at
json.finished_at @session.finished_at

json.steps @session.cooking_step_progresses.includes(:recipe_step).order("recipe_steps.position") do |progress|
  json.step_id progress.recipe_step_id
  json.position progress.recipe_step.position
  json.title progress.recipe_step.title
  json.description progress.recipe_step.description
  json.estimated_minutes progress.recipe_step.estimated_minutes
  json.completed progress.completed
  json.completed_at progress.completed_at
end
