import User from '#models/user'

export default class AuthController {
  public async register({ request, response }: any) {
    const { fullName, email, password, role } = request.only([
      'fullName',
      'email',
      'password',
      'role'
    ])

    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'user'
    })

    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token: token.value!.release()
    })
  }

  public async login({ request, response }: any) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        },
        token: token.value!.release()
      })
    } catch {
      return response.unauthorized('Invalid credentials')
    }
  }

  public async logout({ auth, response }: any) {
    await auth.authenticate()
    
    const token = auth.user?.currentAccessToken
    if (token) {
      await User.accessTokens.delete(auth.user, token.identifier)
    }

    return response.ok({ message: 'Logged out successfully' })
  }

  public async me({ auth, response }: any) {
    await auth.authenticate()
    const user = auth.user!
    
    return response.ok({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    })
  }
}