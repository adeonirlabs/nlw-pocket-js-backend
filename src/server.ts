import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import {
  type CreateGoalInput,
  createGoal,
} from 'src/use-cases/goals/create-goal'
import { z } from 'zod'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

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

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running on port http://localhost:3333')
  })
