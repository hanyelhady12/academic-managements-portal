import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all teaching materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const section = searchParams.get('section')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (section) where.section = section

    const materials = await db.teachingMaterial.findMany({
      where,
      include: {
        course: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('Error fetching teaching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teaching materials' },
      { status: 500 }
    )
  }
}

// POST - Create a new teaching material
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Admins and regular users can create teaching materials
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { title, courseId, type, description, fileUrl, externalUrl, section } = body

    if (!title || !courseId || !type) {
      return NextResponse.json(
        { error: 'Title, course ID, and type are required' },
        { status: 400 }
      )
    }

    const material = await db.teachingMaterial.create({
      data: {
        title,
        courseId,
        type,
        description: description || null,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
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

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Error creating teaching material:', error)
    return NextResponse.json(
      { error: 'Failed to create teaching material' },
      { status: 500 }
    )
  }
}
