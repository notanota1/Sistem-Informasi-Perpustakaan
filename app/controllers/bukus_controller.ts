import { HttpContext } from '@adonisjs/core/http'
import { eventService, EVENTS } from '#services/event_service'

export default class BukuController {
  async getAll({ response }: HttpContext) {
    try {
      const Buku = (await import('#models/buku')).default
      const buku = await Buku.all()
      return response.ok(buku)
    } catch (error) {
      return response.badRequest({
        error: 'Failed to get books',
        message: error.message
      })
    }
  }

  async create({ request, response }: HttpContext) {
    try {
      const bukuData = request.only([
        'judul', 'penulis', 'penerbit', 'tahunTerbit', 'isbn', 'stok', 'deskripsi'
      ])
      
      const Buku = (await import('#models/buku')).default
      const buku = await Buku.create(bukuData)
      
      // Broadcast ke semua client
      eventService.broadcast(EVENTS.BUKU_CREATED, buku)
      console.log('📢 Broadcast buku created to', eventService.getClientCount(), 'clients')
      
      return response.created(buku)
    } catch (error) {
      return response.badRequest({
        error: 'Failed to create book',
        message: error.message
      })
    }
  }

  // ✅ TAMBAHKAN METHOD UPDATE YANG HILANG
  async update({ params, request, response }: HttpContext) {
    try {
      const bukuData = request.only([
        'judul', 'penulis', 'penerbit', 'tahunTerbit', 'isbn', 'stok', 'deskripsi'
      ])
      
      const Buku = (await import('#models/buku')).default
      const buku = await Buku.find(params.id)
      
      if (!buku) {
        return response.notFound({ error: 'Buku tidak ditemukan' })
      }
      
      buku.merge(bukuData)
      await buku.save()
      
      // Broadcast update
      eventService.broadcast(EVENTS.BUKU_UPDATED, buku)
      console.log('📢 Broadcast buku updated to', eventService.getClientCount(), 'clients')
      
      return response.ok(buku)
    } catch (error) {
      return response.badRequest({
        error: 'Gagal update buku',
        message: error.message
      })
    }
  }

  async delete({ params, response }: HttpContext) {
    try {
      const Buku = (await import('#models/buku')).default
      const Peminjaman = (await import('#models/peminjaman')).default
      
      const buku = await Buku.find(params.id)
      if (!buku) {
        return response.notFound({ error: 'Buku tidak ditemukan' })
      }
      
      // Simpan data sebelum dihapus
      const deletedBuku = { id: buku.id, judul: buku.judul }
      
      // Hapus data peminjaman terkait
      await Peminjaman.query().where('buku_id', params.id).delete()
      
      // Hapus buku
      await buku.delete()
      
      // Broadcast deletion
      eventService.broadcast(EVENTS.BUKU_DELETED, deletedBuku)
      console.log('📢 Broadcast buku deleted to', eventService.getClientCount(), 'clients')
      
      return response.ok({
        success: true,
        message: 'Buku berhasil dihapus'
      })
    } catch (error) {
      return response.badRequest({
        error: 'Gagal menghapus buku',
        message: error.message
      })
    }
  }
}