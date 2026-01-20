import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Initialize first admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      )
    }

    // Create admin user
    const admin = await db.user.create({
      data: {
        email,
        password,
        name,
        role: 'admin',
        isActive: true,
      }
    })

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin as any

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: adminWithoutPassword
    }, { status: 201 })
  } catch (error) {
    console.error('Error initializing admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
