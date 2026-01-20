# Faculty Schedule Management System - Complete Setup Guide

## 🎉 System Now Includes:

✅ **User Authentication** - Multiple users can log in
✅ **Admin & User Roles** - One admin, unlimited regular users
✅ **Boys & Girls Sections** - All courses/faculty/exams/labs can be assigned to sections
✅ **Lecturers** - Faculty type field for lecturers
✅ **Exams Management** - Full exam scheduling
✅ **Labs Management** - Laboratory sessions with scheduling
✅ **Teaching Materials** - Educational resources and files
✅ **Full User Tracking** - Who created/modified everything
✅ **Permission System** - Admins vs regular users

---

## 🚀 First Time Setup

### Step 1: Create First Admin User

After the app is running at `http://localhost:3000`, you need to create the **first admin user**.

#### Option A: Using API (Recommended)

Run this command in your terminal:

```bash
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123",
    "name": "System Administrator"
  }'
```

#### Option B: Using Postman/Browser

1. Open Postman or use browser's DevTools Console
2. Send POST request to: `http://localhost:3000/api/init`
3. Body (JSON):
```json
{
  "email": "admin@university.edu",
  "password": "admin123",
  "name": "System Administrator"
}
```

**Response:**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "...",
    "email": "admin@university.edu",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

### Step 2: Login as Admin

1. Go to: `http://localhost:3000/login`
2. Enter admin email and password
3. Click "Sign In"

You're now logged in as **Admin** with full permissions!

---

## 👥 Admin Capabilities

As an **Admin**, you can:

### Faculty Management
- ✅ Add, edit, delete faculty members
- ✅ Set gender (male/female/both)
- ✅ Set lecturer type
- ✅ Assign courses to faculty

### Courses Management
- ✅ Add, edit, delete courses
- ✅ Set section (boys/girls/both)
- ✅ Assign year and semester
- ✅ Set credit hours

### Exams Management (Admin Only)
- ✅ Create exams
- ✅ Set exam type (midterm/final/quiz/practical)
- ✅ Set date and duration
- ✅ Set location
- ✅ Assign section (boys/girls/both)
- ✅ Add notes

### Labs Management (Admin Only)
- ✅ Create lab sessions
- ✅ Set day and time
- ✅ Set location
- ✅ Set capacity
- ✅ Assign section (boys/girls/both)

### Teaching Materials
- ✅ Upload materials
- ✅ Set type (handout/presentation/video/reference/assignment)
- ✅ Add file URLs or external links
- ✅ Assign section (boys/girls/both)

---

## 👤 Regular User Capabilities

As a **Regular User**, you can:

### Limited Access
- ✅ View all data
- ✅ Add teaching materials
- ✅ Edit/delete your own teaching materials
- ❌ Cannot add/edit exams (admin only)
- ❌ Cannot add/edit labs (admin only)

---

## 📋 Sections System

### Boys Section
- Courses can be assigned to "boys" section
- Faculty can be marked as "male"
- Exams can be scheduled for "boys"
- Labs can be reserved for "boys"
- Materials can be tagged for "boys"

### Girls Section
- Courses can be assigned to "girls" section
- Faculty can be marked as "female"
- Exams can be scheduled for "girls"
- Labs can be reserved for "girls"
- Materials can be tagged for "girls"

### Both Section
- Resources available to all students
- Used for common resources
- Mixed sections

---

## 🔒 Security & Permissions

### Role-Based Access Control

| Action | Admin | Regular User |
|--------|--------|-------------|
| View Data | ✅ | ✅ |
| Add/Edit/Delete Faculty | ✅ | ❌ |
| Add/Edit/Delete Courses | ✅ | ❌ |
| Add/Edit/Delete Schedule | ✅ | ❌ |
| Add/Edit/Delete Exams | ✅ | ❌ |
| Add/Edit/Delete Labs | ✅ | ❌ |
| Add/Edit/Delete Materials (own) | ✅ | ✅ |
| Add/Edit/Delete Materials (others) | ✅ | ❌ |

---

## 🧑 User Registration

### For Regular Users

1. Go to: `http://localhost:3000/login`
2. Click "Register New Account"
3. Enter email, password, and name
4. Role will default to "user"

### Creating Additional Admins

Only through the `/api/init` endpoint (one-time setup)

---

## 📊 New Tabs Available

### Exams Tab (Admin Only)
- Create exam schedules
- Set exam type and duration
- Filter by course or section
- View exam calendar

### Labs Tab (Admin Only)
- Create lab sessions
- Schedule by day and time
- Set location and capacity
- Track lab reservations

### Teaching Materials Tab
- Upload educational resources
- Set material type
- Add file or external links
- Filter by course or section

---

## 🎯 Complete Workflow Example

### Scenario: Setting up a new semester for boys and girls

1. **Admin logs in**
2. Navigate to Courses tab
3. Add course "CS101" with section "boys"
4. Add course "CS101" with section "girls"
5. Navigate to Faculty tab
6. Add male faculty member for boys section
7. Add female faculty member for girls section
8. Navigate to Schedule tab
9. Assign male faculty to boys CS101
10. Assign female faculty to girls CS101
11. Navigate to Exams tab
12. Create midterm for boys CS101
13. Create midterm for girls CS101
14. Navigate to Labs tab
15. Schedule labs for boys CS101
16. Schedule labs for girls CS101
17. Navigate to Materials tab
18. Upload materials for boys CS101
19. Upload materials for girls CS101

---

## 🔗 API Endpoints

### Init (Create First Admin)
```
POST /api/init
Body: { email, password, name }
```

### Register (Regular Users)
```
POST /api/users/register
Body: { email, password, name, role: "user" }
```

### Exams (Admin Only)
```
GET /api/exams
POST /api/exams
PUT /api/exams/[id]
DELETE /api/exams/[id]
```

### Labs (Admin Only)
```
GET /api/labs
POST /api/labs
PUT /api/labs/[id]
DELETE /api/labs/[id]
```

### Teaching Materials
```
GET /api/materials
POST /api/materials
PUT /api/materials/[id]
DELETE /api/materials/[id]
```

---

## 🛠️ Troubleshooting

### "Admin already exists"
- First admin already created
- Log in with existing admin credentials

### "Only admins can..."
- You're logged in as regular user
- Log out and login as admin to perform action

### Can't see new tabs
- Refresh the page
- Clear browser cache
- Check you're logged in

---

## 📚 Data Models

### Exam
```typescript
{
  id: string
  title: string
  courseId: string
  examDate: DateTime
  examType: "midterm" | "final" | "quiz" | "practical"
  duration?: number (minutes)
  location?: string
  section?: "boys" | "girls" | "both"
  notes?: string
  createdById?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Lab
```typescript
{
  id: string
  name: string
  courseId: string
  labDay: string (Monday, Tuesday, etc.)
  startTime: string (09:00 format)
  endTime: string (11:00 format)
  location?: string
  capacity?: number
  section?: "boys" | "girls" | "both"
  createdById?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### TeachingMaterial
```typescript
{
  id: string
  title: string
  courseId: string
  type: "handout" | "presentation" | "video" | "reference" | "assignment"
  description?: string
  fileUrl?: string
  externalUrl?: string
  section?: "boys" | "girls" | "both"
  createdById?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## ✅ System Status

**Multi-User Support**: ✅ Active
**Admin System**: ✅ One Admin
**User System**: ✅ Unlimited Regular Users
**Role-Based Permissions**: ✅ Implemented
**Sections (Boys/Girls)**: ✅ Implemented
**Exams Management**: ✅ Active
**Labs Management**: ✅ Active
**Teaching Materials**: ✅ Active
**User Tracking**: ✅ Complete Audit Trail
**Gender Support**: ✅ Faculty & Courses have gender
**Lecturer Types**: ✅ Faculty have lecturer type

---

**Ready to use!** Start by creating your admin user and invite your team! 🎉
