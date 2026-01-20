import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Update a teaching material
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins and the creator can update materials
    const material = await db.teachingMaterial.findUnique({
      where: { id: params.id }
    })
    
    if (session?.user?.role !== 'admin' && material?.createdById !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Only admins and the creator can update materials' },
        { status: 403 }
      )
    }
    
    const { title, courseId, type, description, fileUrl, externalUrl, section } = await request.json()

    const updatedMaterial = await db.teachingMaterial.update({
      where: { id: params.id },
      data: {
        title,
        courseId,
        type,
        description: description || null,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        section: section || null,
      },
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(updatedMaterial)
  } catch (error) {
    console.error('Error updating teaching material:', error)
    return NextResponse.json(
      { error: 'Failed to update teaching material' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a teaching material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins and the creator can delete materials
    const material = await db.teachingMaterial.findUnique({
      where: { id: params.id }
    })
    
    if (session?.user?.role !== 'admin' && material?.createdById !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Only admins and the creator can delete materials' },
        { status: 403 }
      )
    }
    
    await db.teachingMaterial.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting teaching material:', error)
    return NextResponse.json(
      { error: 'Failed to delete teaching material' },
      { status: 500 }
    )
  }
}
