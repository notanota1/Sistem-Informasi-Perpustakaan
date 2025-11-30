import Route from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import BukuController from '#controllers/bukus_controller'
import PeminjamanController from '#controllers/peminjamen_controller'
import { eventService } from '#services/event_service'
import { middleware } from '#start/kernel'
const auth = middleware.auth()

const authController = new AuthController()
const bukuController = new BukuController()
const peminjamanController = new PeminjamanController()

// Test route
Route.get('/', async () => {
  return { 
    message: 'Sistem Perpustakaan API is working!',
    timestamp: new Date().toISOString()
  }
})

// SSE Route untuk real-time updates
Route.get('/events', async ({ response }) => {
  response.response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  // Tambah client ke event service
  eventService.addClient(response.response)

  // Kirim heartbeat setiap 30 detik
  const heartbeat = setInterval(() => {
    try {
      response.response.write(`data: ${JSON.stringify({ event: 'heartbeat', data: { time: new Date().toISOString() } })}\n\n`)
    } catch (error) {
      clearInterval(heartbeat)
    }
  }, 30000)

  // Handle client disconnect
  response.response.on('close', () => {
    clearInterval(heartbeat)
    eventService.removeClient(response.response)
  })
})

// Info tentang connected clients
Route.get('/events/info', async () => {
  return {
    connectedClients: eventService.getClientCount(),
    timestamp: new Date().toISOString()
  }
})

// Auth routes
Route.post('/register', (ctx) => authController.register(ctx))
Route.post('/login', (ctx) => authController.login(ctx))
Route.post('/logout', (ctx) => authController.logout(ctx))
Route.get('/me', (ctx) => authController.me(ctx))

// Buku routes
Route.get('/buku', (ctx) => bukuController.getAll(ctx))
Route.post('/buku', (ctx) => bukuController.create(ctx))
Route.put('/buku/:id', (ctx) => bukuController.update(ctx))
Route.delete('/buku/:id', (ctx) => bukuController.delete(ctx))

// Peminjaman routes
// routes.ts - COMMENT AUTH MIDDLEWARE SEMENTARA:
Route.get('/peminjaman', (ctx) => peminjamanController.getAll(ctx))
// .use(middleware.auth()) // ⚠️ COMMENT THIS LINE TEMPORARILY
Route.post('/peminjaman', (ctx) => peminjamanController.create(ctx)).use(auth)
Route.post('/peminjaman/:id/pengembalian', (ctx) => peminjamanController.pengembalian(ctx)).use(auth)


Route.get('/peminjaman/saya', (ctx) => peminjamanController.getAll(ctx)) // Untuk user