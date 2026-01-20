import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role = 'user' } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if trying to create admin role
    if (role === 'admin') {
      const existingAdmin = await db.user.findFirst({
        where: { role: 'admin' }
      })

      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Admin already exists. Use the init endpoint to create the first admin.' },
          { status: 400 }
        )
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        role,
        password,
        isActive: true,
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
