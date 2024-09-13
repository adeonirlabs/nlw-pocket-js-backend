import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { goalsRoutes } from 'src/routes/goals'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(goalsRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running on port http://localhost:3333')
  })
