import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Update a faculty member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { name, rank, department } = await request.json()

    const faculty = await db.facultyMember.update({
      where: { id: params.id },
      data: {
        name,
        rank,
        department: department || null,
        updatedById: session?.user?.id || null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error updating faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty member' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a faculty member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.scheduleAssignment.deleteMany({
      where: { facultyId: params.id },
    })

    await db.facultyMember.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    )
  }
}
