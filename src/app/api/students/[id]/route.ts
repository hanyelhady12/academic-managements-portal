import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET single student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await db.student.findUnique({
      where: { id: params.id },
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

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

// PUT update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, studentId, email, gender, year, semester, section, phone, notes } = body

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id: params.id },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student ID is being changed and if it conflicts with another student
    if (studentId && studentId !== existingStudent.studentId) {
      const duplicateStudent = await db.student.findUnique({
        where: { studentId },
      })

      if (duplicateStudent) {
        return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 })
      }
    }

    // Check if email is being changed and if it conflicts with another student
    if (email && email !== existingStudent.email) {
      const duplicateEmail = await db.student.findUnique({
        where: { email },
      })

      if (duplicateEmail) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const student = await db.student.update({
      where: { id: params.id },
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

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id: params.id },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    await db.student.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
