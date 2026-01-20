import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all activities
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activities = await db.activity.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        attendanceRecords: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                studentId: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      courseId,
      groupId,
      startDate,
      endDate,
      location,
      maxScore,
      section,
    } = body

    // Validate required fields
    if (!title || !type || !startDate) {
      return NextResponse.json(
        { error: 'Title, type, and start date are required' },
        { status: 400 }
      )
    }

    // If courseId is provided, verify it exists
    if (courseId) {
      const course = await db.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
    }

    // If groupId is provided, verify it exists
    if (groupId) {
      const group = await db.studentGroup.findUnique({
        where: { id: groupId },
      })

      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
    }

    const activity = await db.activity.create({
      data: {
        title,
        description,
        type,
        courseId,
        groupId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        maxScore,
        section,
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
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
