class CookingSession < ApplicationRecord
  belongs_to :user
  belongs_to :recipe

  has_many :cooking_step_progresses, dependent: :destroy

  enum :status, { started: "started", finished: "finished" }

  validates :status, presence: true

  def finish!
    update!(status: :finished, finished_at: Time.current)
  end
end
