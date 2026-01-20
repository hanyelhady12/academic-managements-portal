import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Update an exam
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can update exams
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update exams' },
        { status: 403 }
      )
    }
    
    const { title, courseId, examDate, examType, duration, location, section, notes } = await request.json()

    const exam = await db.exam.update({
      where: { id: params.id },
      data: {
        title,
        courseId,
        examDate: examDate ? new Date(examDate) : undefined,
        examType,
        duration: duration ? parseInt(duration) : null,
        location: location || null,
        section: section || null,
        notes: notes || null,
      },
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { error: 'Failed to update exam' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can delete exams
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete exams' },
        { status: 403 }
      )
    }
    
    await db.exam.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}
