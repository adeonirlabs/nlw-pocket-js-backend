import type { FastifyInstance } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { MarkGoalCompletedRequest } from 'src/use-cases/mark-goal-completed'
import { markGoalCompleted } from 'src/use-cases/mark-goal-completed'
import { z } from 'zod'

export const markGoalCompletedRoute: FastifyPluginAsyncZod = async (
  app: FastifyInstance
) => {
  app.post<{ Body: MarkGoalCompletedRequest }>(
    '/complete-goal',
    {
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { goalId } = request.body
      await markGoalCompleted({ goalId })

      return reply.status(204).send()
    }
  )
}
