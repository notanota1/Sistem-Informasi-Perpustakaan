import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'buku'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('judul', 255).notNullable()
      table.string('penulis', 255).notNullable()
      table.string('penerbit', 255)
      table.integer('tahun_terbit')
      table.string('isbn', 20)
      table.integer('stok').defaultTo(0)
      table.text('deskripsi')
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}