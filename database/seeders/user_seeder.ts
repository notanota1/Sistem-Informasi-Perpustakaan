import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Check if admin already exists
    const adminExists = await User.findBy('email', 'admin@perpustakaan.com')
    
    if (!adminExists) {
      await User.create({
        fullName: 'Administrator',
        email: 'admin@perpustakaan.com',
        password: 'admin123', // Change this to a strong password in production
        role: 'admin',
      })
      
      console.log('✅ Admin user created successfully')
      console.log('Email: admin@perpustakaan.com')
      console.log('Password: admin123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Optional: Create sample user account
    const userExists = await User.findBy('email', 'user@perpustakaan.com')
    
    if (!userExists) {
      await User.create({
        fullName: 'User Regular',
        email: 'user@perpustakaan.com',
        password: 'user123', // Change this to a strong password in production
        role: 'user',
      })
      
      console.log('✅ Regular user created successfully')
      console.log('Email: user@perpustakaan.com')
      console.log('Password: user123')
    } else {
      console.log('ℹ️  Regular user already exists')
    }
  }
}
