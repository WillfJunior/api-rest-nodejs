/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'
import { CheckSessionIdExist } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [CheckSessionIdExist],
      schema: { description: 'get all transactions' },
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions').where(
        'session_id',
        sessionId,
      )

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [CheckSessionIdExist],
      schema: { description: 'get transaction by id' },
    },
    async (request) => {
      const { sessionId } = request.cookies

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [CheckSessionIdExist],
      schema: { description: 'get summary' },
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post(
    '/',
    {
      schema: { description: 'Post transaction' },
    },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
        expiration_date: z.string(),
        payment_date: z.string(),
      })

      const { title, amount, type, expiration_date, payment_date } =
        createTransactionBodySchema.parse(request.body)

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = crypto.randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
        })
      }

      await knex('transactions').insert({
        id: crypto.randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
        expiration_date,
        payment_date,
      })
      return reply.status(201).send()
    },
  )
}
