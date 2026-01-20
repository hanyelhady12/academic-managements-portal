import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all schedule assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')

    const where: any = {}
    if (year) where.academicYear = year

    const assignments = await db.scheduleAssignment.findMany({
      where,
      include: {
        facultyMember: true,
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const filtered = semester
      ? assignments.filter(a => a.course.semester === parseInt(semester))
      : assignments

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching schedule assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule assignments' },
      { status: 500 }
    )
  }
}

// POST - Create a new schedule assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { facultyId, courseId, academicYear } = body

    if (!facultyId || !courseId || !academicYear) {
      return NextResponse.json(
        { error: 'Faculty ID, Course ID, and Academic Year are required' },
        { status: 400 }
      )
    }

    const existing = await db.scheduleAssignment.findFirst({
      where: {
        facultyId,
        courseId,
        academicYear,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This course is already assigned to this faculty member for this year' },
        { status: 400 }
      )
    }

    const assignment = await db.scheduleAssignment.create({
      data: {
        facultyId,
        courseId,
        academicYear,
        createdById: session?.user?.id || null,
      },
      include: {
        facultyMember: true,
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule assignment' },
      { status: 500 }
    )
  }
}
