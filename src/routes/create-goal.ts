import type { FastifyInstance } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { CreateGoalRequest } from 'src/use-cases/create-goal'
import { createGoal } from 'src/use-cases/create-goal'
import { z } from 'zod'

export const createGoalRoute: FastifyPluginAsyncZod = async (
  app: FastifyInstance
) => {
  app.post<{ Body: CreateGoalRequest }>(
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
