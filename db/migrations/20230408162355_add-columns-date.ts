import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.string('expiration_date')
  })

  await knex.schema.alterTable('transactions', (table) => {
    table.string('payment_date')
  })
}

export async function down(knex: Knex): Promise<void> {}
