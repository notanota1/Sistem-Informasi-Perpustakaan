import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Peminjaman from './peminjaman.js'

export default class Buku extends BaseModel {
  public static table = 'buku'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare judul: string

  @column()
  declare penulis: string

  @column()
  declare penerbit: string

  @column({ columnName: 'tahun_terbit' })
  declare tahunTerbit: number

  @column()
  declare isbn: string

  @column()
  declare stok: number

  @column()
  declare deskripsi: string

  @hasMany(() => Peminjaman)
  declare peminjaman: any

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}