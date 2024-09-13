import dayjs from 'dayjs'

import { client, database } from '.'
import { goalsCompletedSchema, goalsSchema } from './schema'

async function seed() {
  await database.delete(goalsCompletedSchema)
  await database.delete(goalsSchema)

  const startOfWeek = dayjs().startOf('week')

  const result = await database
    .insert(goalsSchema)
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

  await database.insert(goalsCompletedSchema).values([
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
