import type { FastifyInstance } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from 'src/use-cases/get-week-pending-goals'

export const getWeekPendingGoalsRoute: FastifyPluginAsyncZod = async (
  app: FastifyInstance
) => {
  app.get('/pending-goals', async (_, reply) => {
    const { pendingGoals } = await getWeekPendingGoals()

    return reply.status(200).send({ pendingGoals })
  })
}
