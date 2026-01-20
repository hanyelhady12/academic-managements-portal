'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Download, Plus, Trash2, Edit, Save, Users, BookOpen, GraduationCap, Search, BarChart3, Clock, BookCopy, Filter, ArrowUpDown, FileText, LogOut, LogIn, FlaskConical, CalendarDays, Upload, UserCheck, Presentation, Users2, ClipboardCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Types
interface FacultyMember {
  id: string
  name: string
  rank: string
  department: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

interface Course {
  id: string
  code: string
  name: string
  hours: number
  year: string
  semester: number
  section?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

interface ScheduleEntry {
  id: string
  facultyId: string
  courseId: string
  academicYear: string
  createdAt: string
}

interface Student {
  id: string
  name: string
  studentId: string
  email?: string
  gender?: string
  year: string
  semester: number
  section?: string
  phone?: string
  notes?: string
  groupId?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

interface StudentGroup {
  id: string
  name: string
  description?: string
  courseId?: string
  year?: string
  semester?: number
  section?: string
  maxSize?: number
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
  course?: { id: string; code: string; name: string }
}

interface Activity {
  id: string
  title: string
  description?: string
  type: string
  courseId?: string
  groupId?: string
  startDate: string
  endDate?: string
  location?: string
  maxScore?: number
  section?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
  course?: { id: string; code: string; name: string }
  group?: { id: string; name: string }
}

interface Lab {
  id: string
  name: string
  courseId: string
  labDay: string
  startTime: string
  endTime: string
  location?: string
  capacity?: number
  section?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

interface Exam {
  id: string
  title: string
  courseId: string
  examDate: string
  examType: string
  duration?: number
  location?: string
  section?: string
  notes?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

interface TeachingMaterial {
  id: string
  title: string
  courseId: string
  type: string
  description?: string
  fileUrl?: string
  externalUrl?: string
  section?: string
  createdAt: string
  createdBy?: { id: string; name: string; email: string }
}

// Constants
const ACADEMIC_YEARS = [
  { id: 'prep', name: 'Preparatory Year' },
  { id: 'year1', name: 'First Year' },
  { id: 'year2', name: 'Second Year' },
  { id: 'year3', name: 'Third Year' },
  { id: 'year4', name: 'Fourth Year' },
  { id: 'year5', name: 'Fifth Year' },
]

const FACULTY_RANKS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Teaching Assistant',
]

const SEMESTERS = [
  { id: 1, name: 'First Semester' },
  { id: 2, name: 'Second Semester' },
  { id: 3, name: 'Summer Semester' },
]

const LAB_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const EXAM_TYPES = ['midterm', 'final', 'quiz', 'practical']

const MATERIAL_TYPES = ['handout', 'presentation', 'video', 'reference', 'assignment']

const ACTIVITY_TYPES = ['pbl', 'workshop', 'seminar', 'presentation', 'fieldtrip']

export default function FacultySchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('schedule')

  // Data states
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [materials, setMaterials] = useState<TeachingMaterial[]>([])

  // Filter states
  const [selectedYear, setSelectedYear] = useState('prep')
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  // Search states
  const [studentSearch, setStudentSearch] = useState('')
  const [studentYearFilter, setStudentYearFilter] = useState<string>('all')

  // Dialog states
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showLabDialog, setShowLabDialog] = useState(false)
  const [showExamDialog, setShowExamDialog] = useState(false)
  const [showMaterialDialog, setShowMaterialDialog] = useState(false)

  // Edit states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<TeachingMaterial | null>(null)

  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', studentId: '', email: '', gender: 'male' as 'male' | 'female', year: 'prep', semester: 1, section: 'boys' as 'boys' | 'girls' | 'both', phone: '', notes: '' })
  const [groupForm, setGroupForm] = useState({ name: '', description: '', courseId: '', year: '', semester: 1, section: 'boys' as 'boys' | 'girls' | 'both', maxSize: 10 })
  const [activityForm, setActivityForm] = useState({ title: '', description: '', type: 'pbl', courseId: '', groupId: '', startDate: '', endDate: '', location: '', maxScore: 100, section: 'boys' as 'boys' | 'girls' | 'both' })
  const [labForm, setLabForm] = useState({ name: '', courseId: '', labDay: 'Monday', startTime: '09:00', endTime: '11:00', location: '', capacity: 30, section: 'boys' as 'boys' | 'girls' | 'both' })
  const [examForm, setExamForm] = useState({ title: '', courseId: '', examDate: '', examType: 'midterm', duration: 90, location: '', section: 'boys' as 'boys' | 'girls' | 'both', notes: '' })
  const [materialForm, setMaterialForm] = useState({ title: '', courseId: '', type: 'handout', description: '', fileUrl: '', externalUrl: '', section: 'boys' as 'boys' | 'girls' | 'both' })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      loadAllData()
    }
  }, [session])

  const loadAllData = async () => {
    try {
      const [facultyRes, coursesRes, scheduleRes, studentsRes, groupsRes, activitiesRes, labsRes, examsRes, materialsRes] = await Promise.all([
        fetch('/api/faculty'),
        fetch('/api/courses'),
        fetch('/api/schedule'),
        fetch('/api/students'),
        fetch('/api/groups'),
        fetch('/api/activities'),
        fetch('/api/labs'),
        fetch('/api/exams'),
        fetch('/api/materials'),
      ])

      const [facultyData, coursesData, scheduleData, studentsData, groupsData, activitiesData, labsData, examsData, materialsData] = await Promise.all([
        facultyRes.json(),
        coursesRes.json(),
        scheduleRes.json(),
        studentsRes.json(),
        groupsRes.json(),
        activitiesRes.json(),
        labsRes.json(),
        examsRes.json(),
        materialsRes.json(),
      ])

      setFacultyMembers(facultyData)
      setCourses(coursesData)
      setScheduleEntries(scheduleData)
      setStudents(studentsData)
      setGroups(groupsData)
      setActivities(activitiesData)
      setLabs(labsData)
      setExams(examsData)
      setMaterials(materialsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
    }
  }

  // Statistics
  const statistics = {
    totalFaculty: facultyMembers.length,
    totalCourses: courses.length,
    totalAssignments: scheduleEntries.length,
    totalStudents: students.length,
    totalGroups: groups.length,
    totalActivities: activities.length,
    totalLabs: labs.length,
    totalExams: exams.length,
    totalMaterials: materials.length,
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Academic Management System</CardTitle>
            <CardDescription>Please sign in to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full" size="lg">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Management System</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Complete Faculty & Student Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500">
                  <AvatarFallback className="text-white font-semibold">
                    {session.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{session.user?.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{session.user?.email}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:flex-wrap">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="labs">Labs</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Stats Tab - Moved to top for quick overview */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Faculty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalFaculty}</div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalCourses}</div>
                    <BookCopy className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-100">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalStudents}</div>
                    <Users2 className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-100">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalActivities}</div>
                    <CalendarDays className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-teal-100">Total Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalGroups}</div>
                    <Users2 className="h-8 w-8 text-teal-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-rose-100">Total Labs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalLabs}</div>
                    <FlaskConical className="h-8 w-8 text-rose-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-cyan-100">Total Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalExams}</div>
                    <ClipboardCheck className="h-8 w-8 text-cyan-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-amber-100">Total Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalMaterials}</div>
                    <Presentation className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-indigo-100">Total Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{statistics.totalAssignments}</div>
                    <FileText className="h-8 w-8 text-indigo-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users2 className="h-5 w-5 text-green-600" />
                      Students
                    </CardTitle>
                    <CardDescription>Manage student records</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => { setEditingStudent(null); setStudentForm({ name: '', studentId: '', email: '', gender: 'male', year: 'prep', semester: 1, section: 'boys', phone: '', notes: '' }) }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                          <DialogDescription>Enter student information below</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Name *</Label>
                            <Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Full name" />
                          </div>
                          <div>
                            <Label>Student ID *</Label>
                            <Input value={studentForm.studentId} onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })} placeholder="Student ID" />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="Email address" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Gender</Label>
                              <Select value={studentForm.gender} onValueChange={(v: any) => setStudentForm({ ...studentForm, gender: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Section</Label>
                              <Select value={studentForm.section} onValueChange={(v: any) => setStudentForm({ ...studentForm, section: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="boys">Boys</SelectItem>
                                  <SelectItem value="girls">Girls</SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Year *</Label>
                              <Select value={studentForm.year} onValueChange={(v) => setStudentForm({ ...studentForm, year: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {ACADEMIC_YEARS.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Semester *</Label>
                              <Select value={studentForm.semester.toString()} onValueChange={(v) => setStudentForm({ ...studentForm, semester: parseInt(v) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {SEMESTERS.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="Phone number" />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea value={studentForm.notes} onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })} placeholder="Additional notes" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={async () => {
                            if (!studentForm.name || !studentForm.studentId) {
                              toast({ title: 'Error', description: 'Name and Student ID are required', variant: 'destructive' })
                              return
                            }
                            setIsLoading(true)
                            try {
                              const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students'
                              const method = editingStudent ? 'PUT' : 'POST'
                              const response = await fetch(url, {
                                method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(studentForm),
                              })
                              if (response.ok) {
                                toast({ title: 'Success', description: editingStudent ? 'Student updated' : 'Student added' })
                                setShowStudentDialog(false)
                                loadAllData()
                              } else {
                                const error = await response.json()
                                toast({ title: 'Error', description: error.error, variant: 'destructive' })
                              }
                            } catch (error) {
                              toast({ title: 'Error', description: 'Failed to save student', variant: 'destructive' })
                            } finally {
                              setIsLoading(false)
                            }
                          }} disabled={isLoading}>
                            {isLoading ? 'Saving...' : editingStudent ? 'Update' : 'Add'} Student
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search by name or ID..." className="pl-8" />
                      </div>
                    </div>
                    <div>
                      <Label>Filter by Year</Label>
                      <Select value={studentYearFilter} onValueChange={setStudentYearFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {ACADEMIC_YEARS.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.filter(s => {
                          const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
                          const matchesYear = studentYearFilter === 'all' || s.year === studentYearFilter
                          return matchesSearch && matchesYear
                        }).map(student => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{ACADEMIC_YEARS.find(y => y.id === student.year)?.name}</TableCell>
                            <TableCell>{SEMESTERS.find(s => s.id === student.semester)?.name}</TableCell>
                            <TableCell className="capitalize">{student.section || '-'}</TableCell>
                            <TableCell className="capitalize">{student.gender || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingStudent(student); setStudentForm({ name: student.name, studentId: student.studentId, email: student.email || '', gender: (student.gender as 'male' | 'female') || 'male', year: student.year, semester: student.semester, section: (student.section as 'boys' | 'girls' | 'both') || 'boys', phone: student.phone || '', notes: student.notes || '' }); setShowStudentDialog(true) }}>
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this student?')) return
                                  try {
                                    const response = await fetch(`/api/students/${student.id}`, { method: 'DELETE' })
                                    if (response.ok) {
                                      toast({ title: 'Deleted', description: 'Student deleted successfully' })
                                      loadAllData()
                                    }
                                  } catch (error) {
                                    toast({ title: 'Error', description: 'Failed to delete student', variant: 'destructive' })
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {students.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                              No students found. Add your first student to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-600" />
                      Student Groups
                    </CardTitle>
                    <CardDescription>Manage student groups for PBL activities</CardDescription>
                  </div>
                  <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingGroup(null); setGroupForm({ name: '', description: '', courseId: '', year: '', semester: 1, section: 'boys', maxSize: 10 }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
                        <DialogDescription>Enter group information below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Group Name *</Label>
                          <Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="Group name" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="Group description" />
                        </div>
                        <div>
                          <Label>Course</Label>
                          <Select value={groupForm.courseId} onValueChange={(v) => setGroupForm({ ...groupForm, courseId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No course</SelectItem>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Year</Label>
                            <Select value={groupForm.year} onValueChange={(v) => setGroupForm({ ...groupForm, year: v })}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {ACADEMIC_YEARS.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Semester</Label>
                            <Select value={groupForm.semester.toString()} onValueChange={(v) => setGroupForm({ ...groupForm, semester: parseInt(v) })}>
                              <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Section</Label>
                            <Select value={groupForm.section} onValueChange={(v: any) => setGroupForm({ ...groupForm, section: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="boys">Boys</SelectItem>
                                <SelectItem value="girls">Girls</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Max Size</Label>
                            <Input type="number" value={groupForm.maxSize} onChange={(e) => setGroupForm({ ...groupForm, maxSize: parseInt(e.target.value) })} placeholder="Max students" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          if (!groupForm.name) {
                            toast({ title: 'Error', description: 'Group name is required', variant: 'destructive' })
                            return
                          }
                          setIsLoading(true)
                          try {
                            const url = editingGroup ? `/api/groups/${editingGroup.id}` : '/api/groups'
                            const method = editingGroup ? 'PUT' : 'POST'
                            const response = await fetch(url, {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(groupForm),
                            })
                            if (response.ok) {
                              toast({ title: 'Success', description: editingGroup ? 'Group updated' : 'Group added' })
                              setShowGroupDialog(false)
                              loadAllData()
                            } else {
                              const error = await response.json()
                              toast({ title: 'Error', description: error.error, variant: 'destructive' })
                            }
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to save group', variant: 'destructive' })
                          } finally {
                            setIsLoading(false)
                          }
                        }} disabled={isLoading}>
                          {isLoading ? 'Saving...' : editingGroup ? 'Update' : 'Add'} Group
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Max Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map(group => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.course ? `${group.course.code} - ${group.course.name}` : '-'}</TableCell>
                          <TableCell>{group.year ? ACADEMIC_YEARS.find(y => y.id === group.year)?.name : '-'}</TableCell>
                          <TableCell>{group.semester ? SEMESTERS.find(s => s.id === group.semester)?.name : '-'}</TableCell>
                          <TableCell className="capitalize">{group.section || '-'}</TableCell>
                          <TableCell>{group.maxSize || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingGroup(group); setGroupForm({ name: group.name, description: group.description || '', courseId: group.courseId || '', year: group.year || '', semester: group.semester || 1, section: (group.section as 'boys' | 'girls' | 'both') || 'boys', maxSize: group.maxSize || 10 }); setShowGroupDialog(true) }}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                if (!confirm('Are you sure you want to delete this group?')) return
                                try {
                                  const response = await fetch(`/api/groups/${group.id}`, { method: 'DELETE' })
                                  if (response.ok) {
                                    toast({ title: 'Deleted', description: 'Group deleted successfully' })
                                    loadAllData()
                                  }
                                } catch (error) {
                                  toast({ title: 'Error', description: 'Failed to delete group', variant: 'destructive' })
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {groups.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No groups found. Create your first group to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-orange-600" />
                      Activities
                    </CardTitle>
                    <CardDescription>Manage PBL activities and events</CardDescription>
                  </div>
                  <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingActivity(null); setActivityForm({ title: '', description: '', type: 'pbl', courseId: '', groupId: '', startDate: '', endDate: '', location: '', maxScore: 100, section: 'boys' }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
                        <DialogDescription>Enter activity information below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Title *</Label>
                          <Input value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} placeholder="Activity title" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} placeholder="Activity description" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type *</Label>
                            <Select value={activityForm.type} onValueChange={(v: any) => setActivityForm({ ...activityForm, type: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Section</Label>
                            <Select value={activityForm.section} onValueChange={(v: any) => setActivityForm({ ...activityForm, section: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="boys">Boys</SelectItem>
                                <SelectItem value="girls">Girls</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Course</Label>
                            <Select value={activityForm.courseId} onValueChange={(v) => setActivityForm({ ...activityForm, courseId: v })}>
                              <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No course</SelectItem>
                                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Group</Label>
                            <Select value={activityForm.groupId} onValueChange={(v) => setActivityForm({ ...activityForm, groupId: v })}>
                              <SelectTrigger><SelectValue placeholder="Select group (optional)" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No group</SelectItem>
                                {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date *</Label>
                            <Input type="datetime-local" value={activityForm.startDate} onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })} />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="datetime-local" value={activityForm.endDate} onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Location</Label>
                            <Input value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} placeholder="Location" />
                          </div>
                          <div>
                            <Label>Max Score</Label>
                            <Input type="number" value={activityForm.maxScore} onChange={(e) => setActivityForm({ ...activityForm, maxScore: parseInt(e.target.value) })} placeholder="Max score" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          if (!activityForm.title || !activityForm.type || !activityForm.startDate) {
                            toast({ title: 'Error', description: 'Title, type, and start date are required', variant: 'destructive' })
                            return
                          }
                          setIsLoading(true)
                          try {
                            const url = editingActivity ? `/api/activities/${editingActivity.id}` : '/api/activities'
                            const method = editingActivity ? 'PUT' : 'POST'
                            const response = await fetch(url, {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(activityForm),
                            })
                            if (response.ok) {
                              toast({ title: 'Success', description: editingActivity ? 'Activity updated' : 'Activity added' })
                              setShowActivityDialog(false)
                              loadAllData()
                            } else {
                              const error = await response.json()
                              toast({ title: 'Error', description: error.error, variant: 'destructive' })
                            }
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to save activity', variant: 'destructive' })
                          } finally {
                            setIsLoading(false)
                          }
                        }} disabled={isLoading}>
                          {isLoading ? 'Saving...' : editingActivity ? 'Update' : 'Add'} Activity
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map(activity => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.title}</TableCell>
                          <TableCell className="capitalize">{activity.type}</TableCell>
                          <TableCell>{new Date(activity.startDate).toLocaleString()}</TableCell>
                          <TableCell>{activity.endDate ? new Date(activity.endDate).toLocaleString() : '-'}</TableCell>
                          <TableCell>{activity.location || '-'}</TableCell>
                          <TableCell className="capitalize">{activity.section || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingActivity(activity); setActivityForm({ title: activity.title, description: activity.description || '', type: activity.type, courseId: activity.courseId || '', groupId: activity.groupId || '', startDate: activity.startDate.split('.')[0], endDate: activity.endDate ? activity.endDate.split('.')[0] : '', location: activity.location || '', maxScore: activity.maxScore || 100, section: (activity.section as 'boys' | 'girls' | 'both') || 'boys' }); setShowActivityDialog(true) }}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                if (!confirm('Are you sure you want to delete this activity?')) return
                                try {
                                  const response = await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' })
                                  if (response.ok) {
                                    toast({ title: 'Deleted', description: 'Activity deleted successfully' })
                                    loadAllData()
                                  }
                                } catch (error) {
                                  toast({ title: 'Error', description: 'Failed to delete activity', variant: 'destructive' })
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {activities.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No activities found. Create your first activity to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-rose-600" />
                      Labs
                    </CardTitle>
                    <CardDescription>Manage laboratory sessions</CardDescription>
                  </div>
                  <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingLab(null); setLabForm({ name: '', courseId: '', labDay: 'Monday', startTime: '09:00', endTime: '11:00', location: '', capacity: 30, section: 'boys' }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lab
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingLab ? 'Edit Lab' : 'Add New Lab'}</DialogTitle>
                        <DialogDescription>Enter lab information below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Lab Name *</Label>
                          <Input value={labForm.name} onChange={(e) => setLabForm({ ...labForm, name: e.target.value })} placeholder="Lab name" />
                        </div>
                        <div>
                          <Label>Course *</Label>
                          <Select value={labForm.courseId} onValueChange={(v) => setLabForm({ ...labForm, courseId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                            <SelectContent>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Day *</Label>
                            <Select value={labForm.labDay} onValueChange={(v: any) => setLabForm({ ...labForm, labDay: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {LAB_DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Section</Label>
                            <Select value={labForm.section} onValueChange={(v: any) => setLabForm({ ...labForm, section: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boys">Boys</SelectItem>
                              <SelectItem value="girls">Girls</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Time *</Label>
                            <Input type="time" value={labForm.startTime} onChange={(e) => setLabForm({ ...labForm, startTime: e.target.value })} />
                          </div>
                          <div>
                            <Label>End Time *</Label>
                            <Input type="time" value={labForm.endTime} onChange={(e) => setLabForm({ ...labForm, endTime: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Location</Label>
                            <Input value={labForm.location} onChange={(e) => setLabForm({ ...labForm, location: e.target.value })} placeholder="Lab location" />
                          </div>
                          <div>
                            <Label>Capacity</Label>
                            <Input type="number" value={labForm.capacity} onChange={(e) => setLabForm({ ...labForm, capacity: parseInt(e.target.value) })} placeholder="Max students" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          if (!labForm.name || !labForm.courseId) {
                            toast({ title: 'Error', description: 'Lab name and course are required', variant: 'destructive' })
                            return
                          }
                          setIsLoading(true)
                          try {
                            const url = editingLab ? `/api/labs/${editingLab.id}` : '/api/labs'
                            const method = editingLab ? 'PUT' : 'POST'
                            const response = await fetch(url, {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(labForm),
                            })
                            if (response.ok) {
                              toast({ title: 'Success', description: editingLab ? 'Lab updated' : 'Lab added' })
                              setShowLabDialog(false)
                              loadAllData()
                            } else {
                              const error = await response.json()
                              toast({ title: 'Error', description: error.error, variant: 'destructive' })
                            }
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to save lab', variant: 'destructive' })
                          } finally {
                            setIsLoading(false)
                          }
                        }} disabled={isLoading}>
                          {isLoading ? 'Saving...' : editingLab ? 'Update' : 'Add'} Lab
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Lab Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labs.map(lab => {
                        const course = courses.find(c => c.id === lab.courseId)
                        return (
                          <TableRow key={lab.id}>
                            <TableCell className="font-medium">{lab.name}</TableCell>
                            <TableCell>{course ? `${course.code} - ${course.name}` : '-'}</TableCell>
                            <TableCell>{lab.labDay}</TableCell>
                            <TableCell>{lab.startTime} - {lab.endTime}</TableCell>
                            <TableCell>{lab.location || '-'}</TableCell>
                            <TableCell>{lab.capacity || '-'}</TableCell>
                            <TableCell className="capitalize">{lab.section || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingLab(lab); setLabForm({ name: lab.name, courseId: lab.courseId, labDay: lab.labDay, startTime: lab.startTime, endTime: lab.endTime, location: lab.location || '', capacity: lab.capacity || 30, section: (lab.section as 'boys' | 'girls' | 'both') || 'boys' }); setShowLabDialog(true) }}>
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this lab?')) return
                                  try {
                                    const response = await fetch(`/api/labs/${lab.id}`, { method: 'DELETE' })
                                    if (response.ok) {
                                      toast({ title: 'Deleted', description: 'Lab deleted successfully' })
                                      loadAllData()
                                    }
                                  } catch (error) {
                                    toast({ title: 'Error', description: 'Failed to delete lab', variant: 'destructive' })
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {labs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            No labs found. Add your first lab to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-cyan-600" />
                      Exams
                    </CardTitle>
                    <CardDescription>Manage exam schedules</CardDescription>
                  </div>
                  <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingExam(null); setExamForm({ title: '', courseId: '', examDate: '', examType: 'midterm', duration: 90, location: '', section: 'boys', notes: '' }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
                        <DialogDescription>Enter exam information below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Exam Title *</Label>
                          <Input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="Exam title" />
                        </div>
                        <div>
                          <Label>Course *</Label>
                          <Select value={examForm.courseId} onValueChange={(v) => setExamForm({ ...examForm, courseId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                            <SelectContent>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Exam Type *</Label>
                            <Select value={examForm.examType} onValueChange={(v: any) => setExamForm({ ...examForm, examType: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {EXAM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Section</Label>
                            <Select value={examForm.section} onValueChange={(v: any) => setExamForm({ ...examForm, section: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boys">Boys</SelectItem>
                              <SelectItem value="girls">Girls</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Exam Date *</Label>
                            <Input type="datetime-local" value={examForm.examDate} onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })} />
                          </div>
                          <div>
                            <Label>Duration (minutes)</Label>
                            <Input type="number" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })} placeholder="90" />
                          </div>
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input value={examForm.location} onChange={(e) => setExamForm({ ...examForm, location: e.target.value })} placeholder="Exam location" />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea value={examForm.notes} onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })} placeholder="Additional notes" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          if (!examForm.title || !examForm.courseId || !examForm.examDate) {
                            toast({ title: 'Error', description: 'Title, course, and exam date are required', variant: 'destructive' })
                            return
                          }
                          setIsLoading(true)
                          try {
                            const url = editingExam ? `/api/exams/${editingExam.id}` : '/api/exams'
                            const method = editingExam ? 'PUT' : 'POST'
                            const response = await fetch(url, {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(examForm),
                            })
                            if (response.ok) {
                              toast({ title: 'Success', description: editingExam ? 'Exam updated' : 'Exam added' })
                              setShowExamDialog(false)
                              loadAllData()
                            } else {
                              const error = await response.json()
                              toast({ title: 'Error', description: error.error, variant: 'destructive' })
                            }
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to save exam', variant: 'destructive' })
                          } finally {
                            setIsLoading(false)
                          }
                        }} disabled={isLoading}>
                          {isLoading ? 'Saving...' : editingExam ? 'Update' : 'Add'} Exam
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map(exam => {
                        const course = courses.find(c => c.id === exam.courseId)
                        return (
                          <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell>{course ? `${course.code} - ${course.name}` : '-'}</TableCell>
                            <TableCell className="capitalize">{exam.examType}</TableCell>
                            <TableCell>{new Date(exam.examDate).toLocaleString()}</TableCell>
                            <TableCell>{exam.duration ? `${exam.duration} min` : '-'}</TableCell>
                            <TableCell>{exam.location || '-'}</TableCell>
                            <TableCell className="capitalize">{exam.section || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingExam(exam); setExamForm({ title: exam.title, courseId: exam.courseId, examDate: exam.examDate.split('.')[0], examType: exam.examType, duration: exam.duration || 90, location: exam.location || '', section: (exam.section as 'boys' | 'girls' | 'both') || 'boys', notes: exam.notes || '' }); setShowExamDialog(true) }}>
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this exam?')) return
                                  try {
                                    const response = await fetch(`/api/exams/${exam.id}`, { method: 'DELETE' })
                                    if (response.ok) {
                                      toast({ title: 'Deleted', description: 'Exam deleted successfully' })
                                      loadAllData()
                                    }
                                  } catch (error) {
                                    toast({ title: 'Error', description: 'Failed to delete exam', variant: 'destructive' })
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {exams.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            No exams found. Add your first exam to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Presentation className="h-5 w-5 text-amber-600" />
                      Teaching Materials
                    </CardTitle>
                    <CardDescription>Manage teaching resources</CardDescription>
                  </div>
                  <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingMaterial(null); setMaterialForm({ title: '', courseId: '', type: 'handout', description: '', fileUrl: '', externalUrl: '', section: 'boys' }) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
                        <DialogDescription>Enter material information below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Title *</Label>
                          <Input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="Material title" />
                        </div>
                        <div>
                          <Label>Course *</Label>
                          <Select value={materialForm.courseId} onValueChange={(v) => setMaterialForm({ ...materialForm, courseId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                            <SelectContent>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type *</Label>
                            <Select value={materialForm.type} onValueChange={(v: any) => setMaterialForm({ ...materialForm, type: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {MATERIAL_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Section</Label>
                            <Select value={materialForm.section} onValueChange={(v: any) => setMaterialForm({ ...materialForm, section: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boys">Boys</SelectItem>
                              <SelectItem value="girls">Girls</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} placeholder="Material description" />
                        </div>
                        <div>
                          <Label>File URL</Label>
                          <Input value={materialForm.fileUrl} onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                          <Label>External URL</Label>
                          <Input value={materialForm.externalUrl} onChange={(e) => setMaterialForm({ ...materialForm, externalUrl: e.target.value })} placeholder="https://..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          if (!materialForm.title || !materialForm.courseId) {
                            toast({ title: 'Error', description: 'Title and course are required', variant: 'destructive' })
                            return
                          }
                          setIsLoading(true)
                          try {
                            const url = editingMaterial ? `/api/materials/${editingMaterial.id}` : '/api/materials'
                            const method = editingMaterial ? 'PUT' : 'POST'
                            const response = await fetch(url, {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(materialForm),
                            })
                            if (response.ok) {
                              toast({ title: 'Success', description: editingMaterial ? 'Material updated' : 'Material added' })
                              setShowMaterialDialog(false)
                              loadAllData()
                            } else {
                              const error = await response.json()
                              toast({ title: 'Error', description: error.error, variant: 'destructive' })
                            }
                          } catch (error) {
                            toast({ title: 'Error', description: 'Failed to save material', variant: 'destructive' })
                          } finally {
                            setIsLoading(false)
                          }
                        }} disabled={isLoading}>
                          {isLoading ? 'Saving...' : editingMaterial ? 'Update' : 'Add'} Material
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>File URL</TableHead>
                        <TableHead>External URL</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map(material => {
                        const course = courses.find(c => c.id === material.courseId)
                        return (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.title}</TableCell>
                            <TableCell>{course ? `${course.code} - ${course.name}` : '-'}</TableCell>
                            <TableCell className="capitalize">{material.type}</TableCell>
                            <TableCell>{material.description || '-'}</TableCell>
                            <TableCell>{material.fileUrl ? <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a> : '-'}</TableCell>
                            <TableCell>{material.externalUrl ? <a href={material.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a> : '-'}</TableCell>
                            <TableCell className="capitalize">{material.section || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingMaterial(material); setMaterialForm({ title: material.title, courseId: material.courseId, type: material.type, description: material.description || '', fileUrl: material.fileUrl || '', externalUrl: material.externalUrl || '', section: (material.section as 'boys' | 'girls' | 'both') || 'boys' }); setShowMaterialDialog(true) }}>
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this material?')) return
                                  try {
                                    const response = await fetch(`/api/materials/${material.id}`, { method: 'DELETE' })
                                    if (response.ok) {
                                      toast({ title: 'Deleted', description: 'Material deleted successfully' })
                                      loadAllData()
                                    }
                                  } catch (error) {
                                    toast({ title: 'Error', description: 'Failed to delete material', variant: 'destructive' })
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {materials.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            No materials found. Add your first teaching material to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Existing Schedule, Faculty, Courses tabs */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Schedule
                </CardTitle>
                <CardDescription>Assign courses to faculty members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_YEARS.map(year => <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map(sem => <SelectItem key={sem.id} value={sem.id.toString()}>{sem.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Assigned Courses</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyMembers.map(faculty => {
                        const assignedCourses = scheduleEntries.filter(s => s.facultyId === faculty.id)
                        const filteredCourses = assignedCourses.filter(entry => {
                          const course = courses.find(c => c.id === entry.courseId)
                          return course && course.year === selectedYear && course.semester === selectedSemester
                        })
                        const totalHours = filteredCourses.reduce((total, entry) => {
                          const course = courses.find(c => c.id === entry.courseId)
                          return total + (course?.hours || 0)
                        }, 0)

                        return (
                          <TableRow key={faculty.id}>
                            <TableCell className="font-medium">{faculty.name}</TableCell>
                            <TableCell>{faculty.rank}</TableCell>
                            <TableCell>
                              {filteredCourses.length > 0 ? (
                                <div className="space-y-1">
                                  {filteredCourses.map(entry => {
                                    const course = courses.find(c => c.id === entry.courseId)
                                    return course ? (
                                      <div key={entry.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 rounded px-2 py-1">
                                        <span>{course.code} - {course.name}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500">{course.hours}h</span>
                                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={async () => {
                                            if (!confirm('Remove this course assignment?')) return
                                            await fetch(`/api/schedule/${entry.id}`, { method: 'DELETE' })
                                            loadAllData()
                                          }}>
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : <span className="text-slate-500">No courses assigned</span>}
                            </TableCell>
                            <TableCell>
                              <Select onValueChange={(courseId) => {
                                if (courseId) {
                                  fetch('/api/schedule', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ facultyId: faculty.id, courseId, academicYear: selectedYear }),
                                  }).then(() => loadAllData())
                                }
                              }}>
                                <SelectTrigger><SelectValue placeholder="Assign course" /></SelectTrigger>
                                <SelectContent>
                                  {courses.filter(c => c.year === selectedYear && c.semester === selectedSemester).map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.code} - {course.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Faculty Members
                </CardTitle>
                <CardDescription>Manage faculty information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyMembers.map(faculty => (
                        <TableRow key={faculty.id}>
                          <TableCell className="font-medium">{faculty.name}</TableCell>
                          <TableCell>{faculty.rank}</TableCell>
                          <TableCell>{faculty.department || '-'}</TableCell>
                          <TableCell>
                            {faculty.createdBy ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Avatar className="h-5 w-5 bg-gradient-to-br from-purple-500 to-pink-500">
                                  <AvatarFallback className="text-white text-xs">{faculty.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{faculty.createdBy.name}</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={async () => {
                                const name = prompt('Edit faculty name:', faculty.name)
                                if (name) {
                                  await fetch(`/api/faculty/${faculty.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name, rank: faculty.rank, department: faculty.department }),
                                  })
                                  loadAllData()
                                }
                              }}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                if (!confirm('Delete this faculty member?')) return
                                await fetch(`/api/faculty/${faculty.id}`, { method: 'DELETE' })
                                loadAllData()
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookCopy className="h-5 w-5 text-purple-600" />
                  Courses
                </CardTitle>
                <CardDescription>Manage course information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map(course => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>{course.hours}</TableCell>
                          <TableCell>{ACADEMIC_YEARS.find(y => y.id === course.year)?.name}</TableCell>
                          <TableCell>{SEMESTERS.find(s => s.id === course.semester)?.name}</TableCell>
                          <TableCell className="capitalize">{course.section || '-'}</TableCell>
                          <TableCell>
                            {course.createdBy ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Avatar className="h-5 w-5 bg-gradient-to-br from-purple-500 to-pink-500">
                                  <AvatarFallback className="text-white text-xs">{course.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{course.createdBy.name}</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={async () => {
                                const name = prompt('Edit course name:', course.name)
                                if (name) {
                                  await fetch(`/api/courses/${course.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ code: course.code, name, hours: course.hours, year: course.year, semester: course.semester, section: course.section }),
                                  })
                                  loadAllData()
                                }
                              }}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                if (!confirm('Delete this course?')) return
                                await fetch(`/api/courses/${course.id}`, { method: 'DELETE' })
                                loadAllData()
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Academic Management System - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  )
}
