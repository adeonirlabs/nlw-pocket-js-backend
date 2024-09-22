import type { FastifyInstance } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { CreateGoalRequest } from 'src/use-cases/create-goal'
import { getWeekSummary } from 'src/use-cases/get-week-summary'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (
  app: FastifyInstance
) => {
  app.get<{ Body: CreateGoalRequest }>(
    '/week-summary',
    async (request, reply) => {
      const { summary } = await getWeekSummary()

      return reply.status(200).send(summary)
    }
  )
}
