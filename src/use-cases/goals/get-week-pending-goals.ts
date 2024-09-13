import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { database } from 'src/database'
import { goalsCompletedSchema, goalsSchema } from 'src/database/schema'

dayjs.extend(weekOfYear)

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = database.$with('goals_created_up_to_week').as(
    database
      .select({
        id: goalsSchema.id,
        title: goalsSchema.title,
        desiredFrequency: goalsSchema.desiredFrequency,
        createdAt: goalsSchema.createdAt,
      })
      .from(goalsSchema)
      .where(lte(goalsSchema.createdAt, lastDayOfWeek))
  )

  const goalsCompletedCount = database.$with('goals_completed_count').as(
    database
      .select({
        goalId: goalsCompletedSchema.goalId,
        completedCount: count(goalsCompletedSchema.id).as('completedCount'),
      })
      .from(goalsCompletedSchema)
      .where(
        and(
          gte(goalsCompletedSchema.completedAt, firstDayOfWeek),
          lte(goalsCompletedSchema.completedAt, lastDayOfWeek)
        )
      )
      .groupBy(goalsCompletedSchema.goalId)
  )

  const result = await database
    .with(goalsCreatedUpToWeek, goalsCompletedCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredFrequency: goalsCreatedUpToWeek.desiredFrequency,
      completedCount: sql /*sql*/`
        COALESCE(${goalsCompletedCount.completedCount}, 0)
        `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalsCompletedCount,
      eq(goalsCreatedUpToWeek.id, goalsCompletedCount.goalId)
    )

  return { pendingGoals: result }
}
