export class EventService {
  private clients: Set<any> = new Set()

  // Tambah client yang subscribe
  addClient(res: any) {
    this.clients.add(res)
    console.log('Client connected. Total:', this.clients.size)
  }

  // Hapus client
  removeClient(res: any) {
    this.clients.delete(res)
    console.log('Client disconnected. Total:', this.clients.size)
  }

  // Broadcast ke semua client
  broadcast(event: string, data: any) {
    const message = `data: ${JSON.stringify({ event, data })}\n\n`
    
    this.clients.forEach(client => {
      try {
        client.write(message)
      } catch (error) {
        // Hapus client jika error
        this.removeClient(client)
      }
    })
  }

  // Get jumlah client terhubung
  getClientCount() {
    return this.clients.size
  }
}

export const eventService = new EventService()

// Event types
export const EVENTS = {
  BUKU_CREATED: 'buku:created',
  BUKU_UPDATED: 'buku:updated',
  BUKU_DELETED: 'buku:deleted',
  PEMINJAMAN_CREATED: 'peminjaman:created',
  PEMINJAMAN_UPDATED: 'peminjaman:updated',
  PEMINJAMAN_DELETED: 'peminjaman:deleted'
}