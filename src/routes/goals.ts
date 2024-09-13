import type { FastifyInstance } from 'fastify'
import { createGoalRoute } from './createGoal'
import { getWeekPendingGoalsRoute } from './getWeekPendingGoals'

export async function goalsRoutes(app: FastifyInstance) {
  await createGoalRoute(app)
  await getWeekPendingGoalsRoute(app)
}
