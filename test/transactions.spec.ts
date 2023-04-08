import { app } from './../src/app'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new Transaction',
        amount: 1000,
        type: 'credit',
        expiration_date: new Date(),
        payment_date: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'new Transaction',
      amount: 1000,
      type: 'credit',
    })
    const cookies = response.get('Set-Cookie')
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new Transaction',
        amount: 1000,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'new Transaction',
      amount: 1000,
      type: 'credit',
    })
    const cookies = response.get('Set-Cookie')
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new Transaction',
        amount: 1000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'new Transaction',
      amount: 1000,
      type: 'credit',
    })
    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new Transaction',
        amount: 500,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 500,
      }),
    )
  })
})
