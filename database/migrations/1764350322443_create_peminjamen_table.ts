import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'peminjaman'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('buku_id').unsigned().references('id').inTable('buku')
      table.date('tanggal_pinjam').notNullable()
      table.date('tanggal_kembali')
      table.date('batas_kembali').notNullable()
      table.enum('status', ['dipinjam', 'dikembalikan', 'terlambat']).defaultTo('dipinjam')
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}