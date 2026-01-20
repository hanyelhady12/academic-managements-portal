import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Update a lab
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can update labs
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update labs' },
        { status: 403 }
      )
    }
    
    const { name, courseId, labDay, startTime, endTime, location, capacity, section } = await request.json()

    const lab = await db.lab.update({
      where: { id: params.id },
      data: {
        name,
        courseId,
        labDay,
        startTime,
        endTime,
        location: location || null,
        capacity: capacity ? parseInt(capacity) : null,
        section: section || null,
      },
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error updating lab:', error)
    return NextResponse.json(
      { error: 'Failed to update lab' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a lab
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can delete labs
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete labs' },
        { status: 403 }
      )
    }
    
    await db.lab.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lab:', error)
    return NextResponse.json(
      { error: 'Failed to delete lab' },
      { status: 500 }
    )
  }
}
