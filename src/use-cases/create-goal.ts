import { database } from 'src/database'
import { goalsTable } from 'src/database/schema'

export interface CreateGoalRequest {
  title: string
  desiredFrequency: number
}

export async function createGoal(input: CreateGoalRequest) {
  const result = await database
    .insert(goalsTable)
    .values({
      title: input.title,
      desiredFrequency: input.desiredFrequency,
    })
    .returning()

  return { goal: result[0] }
}
