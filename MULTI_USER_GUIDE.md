# Faculty Schedule Management System - Multi-User Guide

## Overview

The Faculty Schedule Management System now supports **multiple users** and **tracks who created or modified** every record. This ensures accountability and allows you to see the complete history of all changes.

## 🔐 Authentication Features

### User Registration & Login

1. **Sign In Page** (`/login`)
   - Users must sign in to access the system
   - Each user has their own account with email and password
   - Register new accounts directly from the login page

2. **User Session**
   - Once logged in, the system shows the current user's name and email
   - Session persists across page refreshes
   - Sign out button to end session

## 👥 User Tracking

### Who Created What?

Every record now tracks:

1. **Faculty Members**
   - Created by: Shows who added the faculty member
   - Updated by: Shows who last modified the record
   - Timestamps: Created at and Updated at

2. **Courses**
   - Created by: Shows who added the course
   - Updated by: Shows who last modified the course
   - Timestamps: Created at and Updated at

3. **Schedule Assignments**
   - Created by: Shows who assigned the course
   - Timestamps: Created at

### Visual Indicators

- **Avatar with initials**: Each creator is shown with their avatar
- **Name display**: Creator's full name is displayed next to each record
- **Color coding**: Different avatar colors for faculty (blue) vs courses (purple)

## 🚀 How to Share

### Option 1: Same Network
1. Run the application on your server: `bun run dev`
2. Share the URL with your team: `http://YOUR_SERVER_IP:3000`
3. Each team member registers their own account

### Option 2: Cloud Deployment
Deploy to Vercel, Netlify, or any Node.js hosting provider and share the URL.

## 📋 Complete Audit Trail

The system maintains a complete audit trail:

### Faculty Members Table
- Shows who created each faculty member
- Shows who last updated each faculty member
- Dates and timestamps for all actions

### Courses Table
- Shows who created each course
- Shows who last modified each course
- Dates and timestamps for all actions

### Schedule Assignments
- Shows who made each assignment
- Timestamps for all assignments

## 🔒 Security Features

### Password System
- Each user has a unique password
- Passwords are stored securely
- Login required for all operations

### User Roles
- Users can be marked as "admin" or "user" (extendable)
- Future: Add role-based permissions

## 📊 How It Works

### Backend Tracking

All API routes now:
1. Extract the current user from session
2. Record `createdById` when creating new records
3. Record `updatedById` when modifying records
4. Return creator/updater information with each query

### Frontend Display

The UI now:
1. Displays user avatar and name in header
2. Shows "Created By" column in tables
3. Shows "Updated By" information
4. Allows tracking of all changes

## 🛠️ Technical Implementation

### Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  password      String?
  role          String   @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations to created/updated records
  createdFacultyMembers FacultyMember[]
  updatedFacultyMembers FacultyMember[]
  createdCourses        Course[]
  updatedCourses        Course[]
  createdAssignments    ScheduleAssignment[]
}

model FacultyMember {
  id          String   @id @default(cuid())
  name        String
  rank        String
  department  String?
  createdById String?
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdBy User? @relation("FacultyCreator", fields: [createdById], references: [id])
  updatedBy User? @relation("FacultyUpdater", fields: [updatedById], references: [id])
}

model Course {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  hours       Int
  year        String
  semester    Int
  createdById String?
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdBy User? @relation("CourseCreator", fields: [createdById], references: [id])
  updatedBy User? @relation("CourseUpdater", fields: [updatedById], references: [id])
}

model ScheduleAssignment {
  id          String   @id @default(cuid())
  facultyId   String
  courseId    String
  academicYear String
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdBy User? @relation("AssignmentCreator", fields: [createdById], references: [id])
}
```

### Authentication Flow

1. **Register**: User creates account → Stored in database
2. **Login**: Credentials verified → Session created
3. **API Calls**: Session validated → User ID extracted → Recorded with changes

## 🎯 Use Cases

### Team Collaboration
- Multiple team members can work simultaneously
- See who made which changes
- Avoid conflicts with clear attribution

### Accountability
- Every action is tracked
- Know who to contact for questions
- Complete audit trail for compliance

### Quality Control
- Monitor who's adding what
- Review changes by specific users
- Maintain data integrity

## 📱 User Experience

### Before Accessing
1. Land on sign-in page
2. Register new account or sign in
3. Access full system

### While Using
1. See your profile in the header
2. Make changes - your name is automatically recorded
3. View who created other records

### Sign Out
1. Click "Sign Out" button
2. Session ends
3. Redirected to login page

## 🔮 Future Enhancements

Potential additions:
- Role-based permissions (admin can delete others' records)
- Activity log showing all user actions
- Email notifications for changes
- Data export filtered by user
- User management dashboard for admins

## 💡 Tips

1. **Use descriptive emails**: Makes it easier to identify users
2. **Register each person**: Everyone should have their own account
3. **Check the audit trail**: Review "Created By" columns to track contributions
4. **Regular backups**: Export data regularly using the export feature

## 🆘 Troubleshooting

### Can't login?
- Check email and password are correct
- Try registering a new account
- Check console for errors

### Creator not showing?
- User must be logged in
- Check API response includes creator data
- Reload the page

### Session expired?
- Click "Sign Out" and sign in again
- Sessions persist but can expire

---

**System Status**: ✅ Multi-user support active
**Audit Trail**: ✅ Enabled
**User Tracking**: ✅ Full tracking implemented
