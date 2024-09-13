import type { FastifyInstance } from 'fastify'
import { createGoal } from 'src/use-cases/goals/create-goal'
import type { CreateGoalInput } from 'src/use-cases/goals/create-goal'
import { z } from 'zod'

export async function createGoalRoute(app: FastifyInstance) {
  app.post<{ Body: CreateGoalInput }>(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredFrequency: z.number().min(1).max(7),
        }),
      },
    },
    async (request, reply) => {
      const { title, desiredFrequency } = request.body
      await createGoal({ title, desiredFrequency })

      return reply.status(201).send()
    }
  )
}
