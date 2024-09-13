import type { FastifyInstance } from 'fastify'
import type { MarkGoalCompletedRequest } from 'src/use-cases/goals/mark-goal-completed'
import { markGoalCompleted } from 'src/use-cases/goals/mark-goal-completed'
import { z } from 'zod'

export async function markGoalCompletedRoute(app: FastifyInstance) {
  app.post<{ Body: MarkGoalCompletedRequest }>(
    '/goal-completed',
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
