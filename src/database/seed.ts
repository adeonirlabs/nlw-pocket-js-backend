import dayjs from 'dayjs'

import { client, database } from '.'
import { goals, goalsCompleted } from './schema'

async function seed() {
  await database.delete(goalsCompleted)
  await database.delete(goals)

  const startOfWeek = dayjs().startOf('week')

  const result = await database
    .insert(goals)
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

  await database.insert(goalsCompleted).values([
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
