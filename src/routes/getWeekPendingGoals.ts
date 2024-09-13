import type { FastifyInstance } from 'fastify'
import { getWeekPendingGoals } from 'src/use-cases/goals/get-week-pending-goals'

export async function getWeekPendingGoalsRoute(app: FastifyInstance) {
  app.get('/pending-goals', async (_, reply) => {
    const { pendingGoals } = await getWeekPendingGoals()

    return reply.status(200).send({ pendingGoals })
  })
}
