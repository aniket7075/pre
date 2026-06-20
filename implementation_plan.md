- **Parents** get a comprehensive view of their child's progress, including attendance, homework, and academic results.

---

## Proposed Changes

### 1. Database Schema Migrations
To support the new features, we need to update our Supabase PostgreSQL schema.

#### [MODIFY] `schema.sql` (and live Database)
- **Update Enum:** Alter `user_role` ENUM to include `non_teaching_staff`.
- **New Table:** `exams` (id, school_id, class_id, name, date, total_marks, created_at).
- **New Table:** `exam_results` (id, exam_id, student_id, marks_obtained, grade, remarks).
- **New Table:** `student_notes` (id, student_id, teacher_id, note_type, content, is_visible_to_parent).

### 2. Backend Enhancements (Node.js/Express)

#### [MODIFY] `backend/src/middlewares/rbac.middleware.ts`
- Update the Role-Based Access Control to distinguish between `teacher` (can grade/evaluate) and `non_teaching_staff` (can manage transport, fees, but not academics).
- Grant `super_admin` and `school_admin` full access to all endpoints.

#### [NEW] `backend/src/controllers/result.controller.ts` & `backend/src/routes/result.routes.ts`
- `POST /api/results`: Teachers add class-wise exam results.
- `GET /api/results/class/:classId`: Teachers/Admins view results for a class.
- `GET /api/results/student/:studentId`: Parents view their child's results.

#### [NEW] `backend/src/controllers/progress.controller.ts` & `backend/src/routes/progress.routes.ts`
- `GET /api/progress/:studentId`: Aggregates Attendance %, Homework completion, and Exam Results into a single "Progress Report" payload for the Parent Dashboard.

#### [MODIFY] `backend/src/controllers/user.controller.ts`
- Add Admin CRUD endpoints to manage staff (Add/Edit/Delete teachers and non-teaching staff) and students.

### 3. Frontend Enhancements (React Native)

#### [NEW] `frontend/src/screens/ResultScreen.tsx`
- **For Staff**: A screen to select a class/section, select an exam, and input marks for all students in a list format.
- **For Parents**: A visually appealing report card view showing their child's grades and teacher remarks.

#### [NEW] `frontend/src/screens/ProgressDashboard.tsx` (Parent View)
- A dashboard specifically for parents to view a holistic summary:
  - Attendance charts (e.g., Pie chart of Present vs Absent).
  - Homework completion stats.
  - Recent academic notes/remarks from teachers.

#### [MODIFY] `frontend/src/screens/AdminDashboard.tsx`
- Add management cards/buttons for "Manage Staff", "Manage Students", "Manage Classes", enabling Admins to perform complete CRUD operations.

#### [MODIFY] `frontend/src/screens/TeacherDashboard.tsx`
- Ensure the UI groups actions "Class-wise". The teacher selects a Class/Section first, then chooses whether to take Attendance, assign Homework, or enter Results.

---

> [!IMPORTANT]
> **User Review Required**
> Because this involves altering the database schema and adding large modules (Exams/Results), we need to ensure the architecture matches your vision.

## Open Questions
1. **Grading System**: Do you want results to be pure Marks (e.g., 85/100) or Grades (A, B, C)?
2. **Non-Teaching Staff**: What specific features should `non_teaching_staff` have access to? (e.g., Only Transport and Fees?)
3. **Approval**: Can I proceed with executing this plan? I will start with the database schema changes first, followed by the backend APIs.
