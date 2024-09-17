import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  BASE_URL: z.string().url().default('http://localhost:3333'),
  PORT: z.coerce.number().default(3333),
})

export const env = envSchema.parse(process.env)
