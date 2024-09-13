import { database } from 'src/database'
import { goalsSchema } from 'src/database/schema'

export interface CreateGoalInput {
  title: string
  desiredFrequency: number
}

export async function createGoal(input: CreateGoalInput) {
  const result = await database
    .insert(goalsSchema)
    .values({
      title: input.title,
      desiredFrequency: input.desiredFrequency,
    })
    .returning()

  const goal = result[0]

  return { goal }
}
