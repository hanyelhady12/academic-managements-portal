import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Test endpoint - no authentication required
export async function GET() {
  try {
    const students = await db.student.findMany()
    return NextResponse.json({
      message: 'Database connection successful',
      totalStudents: students.length,
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        studentId: s.studentId
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database connection failed',
      message: error.message
    }, { status: 500 })
  }
}
