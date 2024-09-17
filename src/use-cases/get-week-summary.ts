import dayjs from 'dayjs'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
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
            )
          `.as('completed_goals'),
        })
        .from(goalsCompletedInWeek)
        .groupBy(goalsCompletedInWeek.completedDate)
    )

  const response = await database
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completedCount: sql /*sql*/`
        (SELECT COUNT(*) FROM ${goalsCompletedInWeek})
      `
        .mapWith(Number)
        .as('completed_count'),
      totalCount: sql /*sql*/`
        (SELECT SUM(${goalsCreatedUpToWeek.desiredFrequency}) FROM ${goalsCreatedUpToWeek})
      `
        .mapWith(Number)
        .as('total_count'),
      goalsPerDay: sql /*sql*/`
          JSON_OBJECT_AGG(
            ${goalsCompletedByWeekDay.completedDate},
            ${goalsCompletedByWeekDay.completedGoals}
          )
        `,
    })
    .from(goalsCompletedByWeekDay)

  return { summary: response }
}
