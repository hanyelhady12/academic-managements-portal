import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all attendance records (optionally filtered by activity or student)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const activityId = searchParams.get('activityId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (activityId) where.activityId = activityId
    if (studentId) where.studentId = studentId

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 })
  }
}

// POST create new attendance record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, activityId, status, notes } = body

    // Validate required fields
    if (!studentId || !activityId || !status) {
      return NextResponse.json(
        { error: 'Student ID, activity ID, and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: present, absent, late, excused' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if activity exists
    const activity = await db.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check if attendance record already exists
    const existingAttendance = await db.attendance.findUnique({
      where: {
        studentId_activityId: {
          studentId,
          activityId,
        },
      },
    })

    if (existingAttendance) {
      // Update existing record
      const attendance = await db.attendance.update({
        where: {
          studentId_activityId: {
            studentId,
            activityId,
          },
        },
        data: {
          status,
          notes,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              studentId: true,
              email: true,
            },
          },
          activity: {
            select: {
              id: true,
              title: true,
              type: true,
              startDate: true,
            },
          },
        },
      })

      return NextResponse.json(attendance)
    }

    // Create new attendance record
    const attendance = await db.attendance.create({
      data: {
        studentId,
        activityId,
        status,
        notes,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
          },
        },
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json({ error: 'Failed to create attendance record' }, { status: 500 })
  }
}

// PUT update attendance record
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, activityId, status, notes } = body

    // Validate required fields
    if (!studentId || !activityId) {
      return NextResponse.json(
        { error: 'Student ID and activity ID are required' },
        { status: 400 }
      )
    }

    // Check if attendance record exists
    const existingAttendance = await db.attendance.findUnique({
      where: {
        studentId_activityId: {
          studentId,
          activityId,
        },
      },
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    const attendance = await db.attendance.update({
      where: {
        studentId_activityId: {
          studentId,
          activityId,
        },
      },
      data: {
        status: status !== undefined ? status : undefined,
        notes,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
          },
        },
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return NextResponse.json({ error: 'Failed to update attendance record' }, { status: 500 })
  }
}

// DELETE attendance record
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const activityId = searchParams.get('activityId')

    if (!studentId || !activityId) {
      return NextResponse.json(
        { error: 'Student ID and activity ID are required' },
        { status: 400 }
      )
    }

    // Check if attendance record exists
    const existingAttendance = await db.attendance.findUnique({
      where: {
        studentId_activityId: {
          studentId,
          activityId,
        },
      },
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    await db.attendance.delete({
      where: {
        studentId_activityId: {
          studentId,
          activityId,
        },
      },
    })

    return NextResponse.json({ message: 'Attendance record deleted successfully' })
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    return NextResponse.json({ error: 'Failed to delete attendance record' }, { status: 500 })
  }
}
