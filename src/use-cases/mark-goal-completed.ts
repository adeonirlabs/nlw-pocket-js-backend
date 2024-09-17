import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { database } from 'src/database'
import { goalsCompletedTable, goalsTable } from 'src/database/schema'

export interface MarkGoalCompletedRequest {
  goalId: string
}

export async function markGoalCompleted(input: MarkGoalCompletedRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCompletedCount = database.$with('goals_completed_count').as(
    database
      .select({
        goalId: goalsCompletedTable.goalId,
        completedCount: count(goalsCompletedTable.id).as('completed_count'),
      })
      .from(goalsCompletedTable)
      .where(
        and(
          gte(goalsCompletedTable.completedAt, firstDayOfWeek),
          lte(goalsCompletedTable.completedAt, lastDayOfWeek),
          eq(goalsCompletedTable.goalId, input.goalId)
        )
      )
      .groupBy(goalsCompletedTable.goalId)
  )

  const response = await database
    .with(goalsCompletedCount)
    .select({
      desiredFrequency: goalsTable.desiredFrequency,
      completedCount: sql /*sql*/`
        COALESCE(${goalsCompletedCount.completedCount}, 0)
        `
        .mapWith(Number)
        .as('completed_count'),
    })
    .from(goalsTable)
    .leftJoin(
      goalsCompletedCount,
      eq(goalsTable.id, goalsCompletedCount.goalId)
    )
    .where(eq(goalsTable.id, input.goalId))

  const { desiredFrequency, completedCount } = response[0]

  if (completedCount >= desiredFrequency) {
    throw new Error('Goal already completed for this week.')
  }

  const result = await database
    .insert(goalsCompletedTable)
    .values({
      goalId: input.goalId,
    })
    .returning()

  return { goalCompleted: result[0] }
}
