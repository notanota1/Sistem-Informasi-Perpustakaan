// app/Middleware/AdminMiddleware.ts
export default class AdminMiddleware {
  public async handle(ctx: any, next: () => Promise<void>) {
    /**
     * Middleware untuk memastikan user adalah admin
     */
    
    try {
      // ✅ Pastikan user sudah login (auth middleware sudah jalan)
      const user = ctx.auth.user
      
      console.log('🔐 AdminMiddleware - Checking user:', user?.email, 'Role:', user?.role)
      
      if (!user) {
        return ctx.response.unauthorized({
          message: 'Silakan login terlebih dahulu'
        })
      }

      // ✅ Cek role admin
      if (user.role !== 'admin') {
        console.log('❌ Access denied - User is not admin')
        return ctx.response.forbidden({
          message: 'Hanya admin yang dapat mengakses fitur ini'
        })
      }

      console.log('👑 Admin access granted for user:', user.email)
      
      // ✅ Jika admin, lanjutkan
      await next()
      
    } catch (error) {
      console.error('❌ AdminMiddleware error:', error)
      return ctx.response.internalServerError({
        message: 'Terjadi kesalahan pada sistem'
      })
    }
  }
}