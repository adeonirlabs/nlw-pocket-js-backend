import { database } from 'src/database'
import { goals } from 'src/database/schema'

export interface CreateGoalInput {
  title: string
  desiredFrequency: number
}

export async function createGoal(input: CreateGoalInput) {
  const result = await database
    .insert(goals)
    .values({
      title: input.title,
      desiredFrequency: input.desiredFrequency,
    })
    .returning()

  const goal = result[0]

  return { goal }
}
