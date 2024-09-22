import dayjs from 'dayjs'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { database } from 'src/database'
import { goalsCompletedTable, goalsTable } from '../database/schema'

export async function getWeekSummary() {
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

  const goalsCompletedInWeek = database.$with('goals_completed_in_week').as(
    database
      .select({
        id: goalsTable.id,
        title: goalsTable.title,
        completedAt: goalsCompletedTable.completedAt,
        completedDate: sql /*sql*/`
          DATE(${goalsCompletedTable.completedAt})
        `.as('completed_date'),
      })
      .from(goalsCompletedTable)
      .innerJoin(goalsTable, eq(goalsTable.id, goalsCompletedTable.goalId))
      .where(
        and(
          gte(goalsCompletedTable.completedAt, firstDayOfWeek),
          lte(goalsCompletedTable.completedAt, lastDayOfWeek)
        )
      )
  )

  const goalsCompletedByWeekDay = database
    .$with('goals_completed_by_week_day')
    .as(
      database
        .select({
          completedDate: goalsCompletedInWeek.completedDate,
          completedGoals: sql /*sql*/`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ${goalsCompletedInWeek.id},
                'title', ${goalsCompletedInWeek.title},
                'completedAt', ${goalsCompletedInWeek.completedAt}
              )
              ORDER BY ${goalsCompletedInWeek.completedAt} ASC
            )
          `.as('completed_goals'),
        })
        .from(goalsCompletedInWeek)
        .groupBy(goalsCompletedInWeek.completedDate)
        .orderBy(desc(goalsCompletedInWeek.completedDate))
    )

  const response = await database
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completedCount: sql /*sql*/`
        COALESCE((SELECT COUNT(*) FROM ${goalsCompletedInWeek}), 0)
      `
        .mapWith(Number)
        .as('completed_count'),
      totalCount: sql /*sql*/`
        COALESCE((SELECT SUM(${goalsCreatedUpToWeek.desiredFrequency}) FROM ${goalsCreatedUpToWeek}), 0)
      `
        .mapWith(Number)
        .as('total_count'),
      goalsPerDay: sql /*sql*/<
        Record<
          string,
          Array<{
            id: string
            title: string
            completedAt: string
          }>
        >
      >`
          JSON_OBJECT_AGG(
            ${goalsCompletedByWeekDay.completedDate},
            ${goalsCompletedByWeekDay.completedGoals}
          )
        `,
    })
    .from(goalsCompletedByWeekDay)

  return { summary: response[0] }
}
