import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { database } from 'src/database'
import { goalsCompletedSchema, goalsSchema } from 'src/database/schema'

export interface MarkGoalCompletedRequest {
  goalId: string
}

export async function markGoalCompleted(input: MarkGoalCompletedRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCompletedCount = database.$with('goals_completed_count').as(
    database
      .select({
        goalId: goalsCompletedSchema.goalId,
        completedCount: count(goalsCompletedSchema.id).as('completed_count'),
      })
      .from(goalsCompletedSchema)
      .where(
        and(
          gte(goalsCompletedSchema.completedAt, firstDayOfWeek),
          lte(goalsCompletedSchema.completedAt, lastDayOfWeek),
          eq(goalsCompletedSchema.goalId, input.goalId)
        )
      )
      .groupBy(goalsCompletedSchema.goalId)
  )

  const response = await database
    .with(goalsCompletedCount)
    .select({
      desiredFrequency: goalsSchema.desiredFrequency,
      completedCount: sql /*sql*/`
        COALESCE(${goalsCompletedCount.completedCount}, 0)
        `
        .mapWith(Number)
        .as('completed_count'),
    })
    .from(goalsSchema)
    .leftJoin(
      goalsCompletedCount,
      eq(goalsSchema.id, goalsCompletedCount.goalId)
    )
    .where(eq(goalsSchema.id, input.goalId))

  const { desiredFrequency, completedCount } = response[0]

  if (completedCount >= desiredFrequency) {
    throw new Error('Goal already completed for this week.')
  }

  const result = await database
    .insert(goalsCompletedSchema)
    .values({
      goalId: input.goalId,
    })
    .returning()

  return { goalCompleted: result[0] }
}
