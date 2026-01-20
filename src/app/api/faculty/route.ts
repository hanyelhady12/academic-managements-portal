import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all faculty members
export async function GET() {
  try {
    const faculty = await db.facultyMember.findMany({
      orderBy: { name: 'asc' },
      include: {
        scheduleAssignments: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      },
    })
    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty members' },
      { status: 500 }
    )
  }
}

// POST - Create a new faculty member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { name, rank, department } = body

    if (!name || !rank) {
      return NextResponse.json(
        { error: 'Name and rank are required' },
        { status: 400 }
      )
    }

    const faculty = await db.facultyMember.create({
      data: {
        name,
        rank,
        department: department || null,
        createdById: session?.user?.id || null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(faculty, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty member' },
      { status: 500 }
    )
  }
}
