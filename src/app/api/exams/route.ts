import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all exams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const section = searchParams.get('section')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (section) where.section = section

    const exams = await db.exam.findMany({
      where,
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { examDate: 'asc' },
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

// POST - Create a new exam
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can create exams
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create exams' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { title, courseId, examDate, examType, duration, location, section, notes } = body

    if (!title || !courseId || !examDate || !examType) {
      return NextResponse.json(
        { error: 'Title, course ID, exam date, and exam type are required' },
        { status: 400 }
      )
    }

    const exam = await db.exam.create({
      data: {
        title,
        courseId,
        examDate: new Date(examDate),
        examType,
        duration: duration ? parseInt(duration) : null,
        location: location || null,
        section: section || null,
        notes: notes || null,
        createdById: session?.user?.id || null,
      },
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}
