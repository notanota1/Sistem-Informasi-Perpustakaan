// app/Middleware/AuthMiddleware.ts
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: any,
    next: () => Promise<void>,
    options: {
      guards?: any[]
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
      return next()
    } catch (error) {
      console.error('AuthMiddleware error:', error)
      throw error
    }
  }
}