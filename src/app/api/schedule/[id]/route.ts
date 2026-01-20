import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Delete a schedule assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.scheduleAssignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule assignment' },
      { status: 500 }
    )
  }
}
