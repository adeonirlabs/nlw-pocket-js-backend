import { database } from 'src/database'
import { goalsSchema } from 'src/database/schema'

export async function getWeekPendingGoals() {
  const result = await database.select().from(goalsSchema)

  return { goals: result }
}
