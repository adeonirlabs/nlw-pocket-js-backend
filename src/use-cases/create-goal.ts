import { database } from 'src/database'
import { goalsSchema } from 'src/database/schema'

export interface CreateGoalRequest {
  title: string
  desiredFrequency: number
}

export async function createGoal(input: CreateGoalRequest) {
  const result = await database
    .insert(goalsSchema)
    .values({
      title: input.title,
      desiredFrequency: input.desiredFrequency,
    })
    .returning()

  return { goal: result[0] }
}
