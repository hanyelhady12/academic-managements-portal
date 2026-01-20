import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all students
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await db.student.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, studentId, email, gender, year, semester, section, phone, notes } = body

    // Validate required fields
    if (!name || !studentId || !year || !semester) {
      return NextResponse.json(
        { error: 'Name, student ID, year, and semester are required' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudent = await db.student.findUnique({
      where: { studentId },
    })

    if (existingStudent) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 })
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.student.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const student = await db.student.create({
      data: {
        name,
        studentId,
        email,
        gender,
        year,
        semester,
        section,
        phone,
        notes,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
