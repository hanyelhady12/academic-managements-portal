import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all labs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const section = searchParams.get('section')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (section) where.section = section

    const labs = await db.lab.findMany({
      where,
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { labDay: 'asc' },
    })

    return NextResponse.json(labs)
  } catch (error) {
    console.error('Error fetching labs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    )
  }
}

// POST - Create a new lab
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can create labs
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create labs' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { name, courseId, labDay, startTime, endTime, location, capacity, section } = body

    if (!name || !courseId || !labDay || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, course ID, lab day, start time, and end time are required' },
        { status: 400 }
      )
    }

    const lab = await db.lab.create({
      data: {
        name,
        courseId,
        labDay,
        startTime,
        endTime,
        location: location || null,
        capacity: capacity ? parseInt(capacity) : null,
        section: section || null,
        createdById: session?.user?.id || null,
      },
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(lab, { status: 201 })
  } catch (error) {
    console.error('Error creating lab:', error)
    return NextResponse.json(
      { error: 'Failed to create lab' },
      { status: 500 }
    )
  }
}
