import type { FastifyInstance } from 'fastify'
import { getWeekPendingGoals } from 'src/use-cases/goals/get-week-pending-goals'

export async function getWeekPendingGoalsRoute(app: FastifyInstance) {
  app.get('/goals', async (_, reply) => {
    const { goals } = await getWeekPendingGoals()

    return reply.status(200).send({ goals })
  })
}
