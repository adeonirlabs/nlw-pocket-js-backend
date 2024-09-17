import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { database } from 'src/database'
import { goalsCompletedTable, goalsTable } from 'src/database/schema'

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = database.$with('goals_created_up_to_week').as(
    database
      .select({
        id: goalsTable.id,
        title: goalsTable.title,
        desiredFrequency: goalsTable.desiredFrequency,
        createdAt: goalsTable.createdAt,
      })
      .from(goalsTable)
      .where(lte(goalsTable.createdAt, lastDayOfWeek))
  )

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
          lte(goalsCompletedTable.completedAt, lastDayOfWeek)
        )
      )
      .groupBy(goalsCompletedTable.goalId)
  )

  const result = await database
    .with(goalsCreatedUpToWeek, goalsCompletedCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredFrequency: goalsCreatedUpToWeek.desiredFrequency,
      completedCount: sql /*sql*/`
        COALESCE(${goalsCompletedCount.completedCount}, 0)
        `
        .mapWith(Number)
        .as('completed_count'),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalsCompletedCount,
      eq(goalsCreatedUpToWeek.id, goalsCompletedCount.goalId)
    )

  return { pendingGoals: result }
}
