import { knex } from './database'
import fastify from 'fastify'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const test = await knex('sqlite_schema').select('*')

  return test
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Http server runnig on port 3333')
  })
