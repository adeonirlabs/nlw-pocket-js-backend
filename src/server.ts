import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal'
import { getWeekPendingGoalsRoute } from './routes/get-week-pending-goals'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import { markGoalCompletedRoute } from './routes/mark-goal-completed'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(createGoalRoute)
app.register(getWeekPendingGoalsRoute)
app.register(markGoalCompletedRoute)
app.register(getWeekSummaryRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running on port http://localhost:3333')
  })
