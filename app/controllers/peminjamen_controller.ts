import { HttpContext } from '@adonisjs/core/http'
import { eventService, EVENTS } from '#services/event_service'

export default class PeminjamanController {

// PeminjamanController - PERBAIKI:
// PeminjamanController - TEMPORARY NO AUTH:
async getAll({ response }: HttpContext) {
  try {
    console.log('🔓 TEMPORARY: No auth - fetching all peminjaman');
    
    const Database = (await import('@adonisjs/lucid/services/db')).default;
    
    const query = `
      SELECT 
        p.id,
        p.user_id as userId,
        p.buku_id as bukuId,
        DATE(p.tanggal_pinjam) as tanggalPinjam,
        DATE(p.batas_kembali) as batasKembali,
        DATE(p.tanggal_kembali) as tanggalKembali,
        p.status,
        b.judul,
        b.penulis,
        u.email as userEmail,
        u.full_name as userFullName,
        u.role as userRole
      FROM peminjaman p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN buku b ON p.buku_id = b.id
      ORDER BY p.id DESC
      LIMIT 50
    `;
    
    const result = await Database.rawQuery(query);
    const peminjaman = result[0];
    
    console.log('📊 Found peminjaman records:', peminjaman.length);
    
    const formattedPeminjaman = peminjaman.map((p: any) => ({
      id: p.id,
      bukuId: p.bukuId,
      userId: p.userId,
      status: p.status,
      tanggalPinjam: p.tanggalPinjam,
      batasKembali: p.batasKembali,
      tanggalKembali: p.tanggalKembali,
      judul: p.judul,
      penulis: p.penulis,
      user: {
        id: p.userId,
        email: p.userEmail,
        fullName: p.userFullName,
        role: p.userRole
      }
    }));
    
    console.log('✅ Sending formatted data:', formattedPeminjaman.length, 'records');
    
    return response.ok(formattedPeminjaman);
    
  } catch (error) {
    console.error('❌ Error in getAll:', error);
    return response.badRequest({
      error: 'Failed to get borrowings',
      message: error.message
    });
  }
}

  // PeminjamanController - PERBAIKI method create:
async create({ request, response, auth }: HttpContext) {
  try {
    const { bukuId } = request.only(['bukuId'])
    
    // Gunakan user dari auth
    await auth.check()
    const currentUser = auth.user!
    
    const Buku = (await import('#models/buku')).default
    const Peminjaman = (await import('#models/peminjaman')).default
    const { DateTime } = await import('luxon')
    
    const buku = await Buku.find(bukuId)
    if (!buku) {
      return response.notFound({ error: 'Buku tidak ditemukan' })
    }
    
    if (buku.stok <= 0) {
      return response.badRequest({ error: 'Stok buku habis' })
    }
    
    // Kurangi stok
    buku.stok -= 1
    await buku.save()
    
    // Buat peminjaman dengan user ID dari auth
    const peminjaman = await Peminjaman.create({
      userId: currentUser.id, // ✅ Gunakan ID user yang login
      bukuId: parseInt(bukuId),
      tanggalPinjam: DateTime.now(),
      batasKembali: DateTime.now().plus({ days: 7 }),
      status: 'dipinjam'
    })
    
    await peminjaman.load('buku')
    
    const responseData = {
      id: peminjaman.id,
      bukuId: peminjaman.bukuId,
      userId: peminjaman.userId, // ✅ Sertakan userId
      status: peminjaman.status,
      tanggalPinjam: peminjaman.tanggalPinjam.toISODate(),
      batasKembali: peminjaman.batasKembali.toISODate(),
      buku: {
        id: peminjaman.buku.id,
        judul: peminjaman.buku.judul,
        penulis: peminjaman.buku.penulis,
        stok: buku.stok
      }
    }

    // ✅ BROADCAST EVENT
    eventService.broadcast(EVENTS.PEMINJAMAN_CREATED, responseData)
    eventService.broadcast(EVENTS.BUKU_UPDATED, buku)
    console.log('📢 Broadcast peminjaman created to', eventService.getClientCount(), 'clients')
    
    return response.created(responseData)
  } catch (error) {
    return response.badRequest({
      error: 'Gagal meminjam buku',
      message: error.message
    })
  }
}

  async pengembalian({ params, response }: HttpContext) {
    try {
      const Peminjaman = (await import('#models/peminjaman')).default
      const Buku = (await import('#models/buku')).default
      const { DateTime } = await import('luxon')
      
      // ✅ CARI PEMINJAMAN DENGAN PRELOAD BUKU
      const peminjaman = await Peminjaman.query()
        .where('id', params.id)
        .preload('buku')
        .first()

      if (!peminjaman) {
        return response.notFound({ error: 'Peminjaman tidak ditemukan' })
      }
      
      // ✅ CARI BUKU DAN TAMBAH STOK
      const buku = await Buku.find(peminjaman.bukuId)
      if (!buku) {
        return response.notFound({ error: 'Buku tidak ditemukan' })
      }
      
      // ✅ TAMBAH STOK BUKU
      buku.stok += 1
      await buku.save()
      console.log('✅ Stok ditambahkan, stok sekarang:', buku.stok)
      
      // ✅ UPDATE STATUS PEMINJAMAN
      peminjaman.status = 'dikembalikan'
      peminjaman.tanggalKembali = DateTime.now()
      await peminjaman.save()
      
      // ✅ FORMAT RESPONSE DENGAN DATA LENGKAP
      const responseData = {
        id: peminjaman.id,
        status: peminjaman.status,
        tanggalPinjam: peminjaman.tanggalPinjam.toISODate(),
        batasKembali: peminjaman.batasKembali.toISODate(),
        tanggalKembali: peminjaman.tanggalKembali?.toISODate(),
        buku: {
          id: buku.id,
          judul: buku.judul,
          penulis: buku.penulis,
          stok: buku.stok // ✅ KIRIM STOK TERBARU
        },
        message: 'Buku berhasil dikembalikan'
      }

      console.log('✅ Pengembalian berhasil:', responseData)
      
      // ✅ BROADCAST EVENT UNTUK REAL-TIME UPDATES
      eventService.broadcast(EVENTS.PEMINJAMAN_UPDATED, responseData)
      eventService.broadcast(EVENTS.BUKU_UPDATED, buku) // ✅ UPDATE STOK DI REAL-TIME
      
      console.log('📢 Broadcast pengembalian to', eventService.getClientCount(), 'clients')
      
      return response.ok(responseData)
    } catch (error) {
      console.error('❌ Error pengembalian:', error.message)
      return response.badRequest({
        error: 'Gagal mengembalikan buku',
        message: error.message
      })
    }
  }
}