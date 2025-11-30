// app/models/peminjaman.ts - PERBAIKI:
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Buku from './buku.js'

export default class Peminjaman extends BaseModel {
  public static table = 'peminjaman'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'buku_id' })
  declare bukuId: number

  @column.date({ columnName: 'tanggal_pinjam' })
  declare tanggalPinjam: DateTime

  @column.date({ columnName: 'tanggal_kembali' })
  declare tanggalKembali: DateTime | null

  @column.date({ columnName: 'batas_kembali' })
  declare batasKembali: DateTime

  @column()
  declare status: string

  // ✅ PERBAIKI: Gunakan type yang proper
  @belongsTo(() => User, {
    foreignKey: 'userId' // Explicitly specify foreign key
  })
  declare user: BelongsTo<typeof User>

  // ✅ PERBAIKI: Gunakan type yang proper
  @belongsTo(() => Buku, {
    foreignKey: 'bukuId' // Explicitly specify foreign key
  })
  declare buku: BelongsTo<typeof Buku>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}