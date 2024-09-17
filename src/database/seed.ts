import dayjs from 'dayjs'

import { client, database } from '.'
import { goalsCompletedTable, goalsTable } from './schema'

async function seed() {
  await database.delete(goalsCompletedTable)
  await database.delete(goalsTable)

  const startOfWeek = dayjs().startOf('week')

  const result = await database
    .insert(goalsTable)
    .values([
      {
        title: 'Take a walk',
        desiredFrequency: 5,
      },
      {
        title: 'Read a book',
        desiredFrequency: 1,
      },
      {
        title: 'Drink 8 glasses of water',
        desiredFrequency: 7,
      },
    ])
    .returning()

  await database.insert(goalsCompletedTable).values([
    {
      goalId: result[0].id,
      completedAt: startOfWeek.toDate(),
    },
    {
      goalId: result[1].id,
      completedAt: startOfWeek.add(1).toDate(),
    },
  ])
}

seed().finally(() => client.end())
