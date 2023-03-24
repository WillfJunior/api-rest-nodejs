import fastify from 'fastify'

import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'
import swagger from '@fastify/swagger'

export const app = fastify()

app.register(swagger, {})
app.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  swagger: {
    info: {
      title: 'Api node JS',
      description: 'API desenvolvida no curso Ignite da Rocketseat',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info',
    },
    host: 'https://ignite-nodejs-2.onrender.com',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'transactions', description: 'transactions related end-points' },
    ],
    definitions: {
      Transaction: {
        type: 'object',
        required: ['title', 'amount', 'type'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          amount: { type: 'decimal' },
          type: { type: 'string' },
        },
      },
    },
  },
})
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})
app.ready((err) => {
  if (err) throw err
  app.swagger()
})
