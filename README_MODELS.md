# Enhanced Data Models for Faculty Performance Management System

This document describes the new and updated data models added to the FPMS application.

## New Models

### 1. AcademicYear
Manages academic year periods with start/end dates.

**Fields:**
- `name`: Academic year name (e.g., "2024-2025")
- `startDate`: Start date of the academic year
- `endDate`: End date of the academic year
- `isActive`: Whether this is the current active year
- `isArchived`: Soft delete flag
- `description`: Optional description

### 2. Semester
Manages semester periods within an academic year.

**Fields:**
- `name`: Semester name
- `academicYear`: Reference to AcademicYear
- `order`: Semester order (1 or 2)
- `startDate`: Start date of the semester
- `endDate`: End date of the semester
- `isActive`: Whether this is the current active semester
- `isArchived`: Soft delete flag

### 3. AchievementCategory
Defines achievement categories with configurable properties.

**Fields:**
- `name`: Display name
- `canonicalName`: Standardized name
- `aliases`: Alternative names for matching
- `section`: Category section (professional, rnd, teaching, extension)
- `points`: Base points for achievements in this category
- `maxPointsPerYear`: Maximum points allowed per year
- `requiresEvidence`: Whether evidence is required
- `requiresApproval`: Whether approval is required
- `weightage`: Weight multiplier for scoring
- `isActive`: Whether the category is active
- `sortOrder`: Display order

### 4. CreditConfig
Configures credit/point settings for each achievement category.

**Fields:**
- `category`: Reference to AchievementCategory
- `basePoints`: Base points value
- `maxPointsPerYear`: Annual maximum
- `maxPointsPerSemester`: Semester maximum
- `weightage`: Point multiplier
- `requiresEvidence`: Evidence requirement flag
- `allowedFileTypes`: Supported file types
- `maxFileSizeMB`: Maximum file size

### 5. College
Stores college/institution information.

**Fields:**
- `name`: College name
- `code`: Unique college code
- `address`, `city`, `state`, `country`, `pincode`: Address details
- `phone`, `email`, `website`: Contact information
- `logo`: Logo URL
- `isActive`: Active status

### 6. Role
Role-based access control system roles.

**Fields:**
- `name`: Role name
- `description`: Role description
- `permissions`: Array of permission names
- `isSystem`: System-defined flag
- `isActive`: Active status

### 7. Permission
Granular permissions for RBAC.

**Fields:**
- `name`: Permission name (e.g., "faculty:create")
- `resource`: Resource type
- `action`: Action type (create, read, update, delete, approve, etc.)
- `scope`: Permission scope (system, department, personal)
- `isSystem`: System-defined flag

### 8. AuditLog
Immutable audit trail for all system actions.

**Fields:**
- `action`: Type of action performed
- `resourceType`: Type of resource affected
- `resourceId`: ID of the affected resource
- `userId`, `userName`, `userRole`: User who performed the action
- `oldValue`, `newValue`: Before/after values
- `changes`: List of changed fields
- `ipAddress`, `userAgent`, `browser`, `device`, `os`: Client information
- `metadata`: Additional context
- `isImmutable`: Flag preventing modification

### 9. Settings
System-wide configuration settings.

**Fields:**
- `key`: Setting key (dot notation for hierarchy)
- `value`: Setting value (any type)
- `category`: Setting category
- `description`: Setting description
- `isSystem`: System-defined flag
- `isEditable`: Whether admins can modify

### 10. NotificationTemplate
Templates for notification messages.

**Fields:**
- `name`: Template name
- `key`: Unique template key
- `type`: Notification type (email, in_app, sms, push)
- `subject`: Email subject
- `body`: Message body with variable placeholders
- `variables`: List of supported variables
- `category`: Template category

### 11. ApprovalWorkflow
Configurable approval workflows.

**Fields:**
- `name`: Workflow name
- `resourceType`: Type of resource this workflow applies to
- `steps`: Array of approval steps with approver roles and conditions
- `isActive`: Active status

### 12. Session
User session management.

**Fields:**
- `userId`, `userRole`: User information
- `token`, `refreshToken`: Authentication tokens
- `ipAddress`, `userAgent`, `browser`, `device`, `os`: Client information
- `expiresAt`: Session expiration
- `isActive`: Active status
- `lastActivity`: Last activity timestamp

## Updated Models

### Department
Enhanced with multi-college support and soft deletes.

**New Fields:**
- `college`: Reference to College
- `hod`: Reference to HOD
- `facultyCount`: Cached faculty count
- `isArchived`, `archivedAt`: Soft delete support
- `mergedInto`: For department mergers
- `sortOrder`: Display order

### Faculty
Enhanced with multi-college support and better tracking.

**New Fields:**
- `department`: Now references Department model instead of string
- `departmentName`: Denormalized department name for queries
- `college`: Reference to College
- `totalCredits`, `currentYearCredits`, `currentSemesterCredits`: Credit tracking
- `createdBy`, `createdByRole`: Creator tracking
- `isArchived`, `archivedAt`: Soft delete support

### HOD
Similar enhancements as Faculty.

**New Fields:**
- `department`: Now references Department model
- `departmentName`: Denormalized department name
- `college`: Reference to College
- `totalCredits`, `currentYearCredits`, `currentSemesterCredits`: Credit tracking
- `isArchived`, `archivedAt`: Soft delete support

### Upload
Major restructuring for academic year/semester support.

**New Fields:**
- `facultyName`: Denormalized faculty name
- `department`, `departmentName`: Now reference Department model
- `college`: Reference to College
- `category`: Now references AchievementCategory model
- `categoryName`: Denormalized category name
- `academicYear`: Reference to AcademicYear
- `semester`: Reference to Semester
- `description`: Achievement description
- `fileName`, `fileSize`, `fileType`: File metadata
- `basePoints`, `weightage`: Scoring configuration
- `rejectionReason`: Reason for rejection
- `approvedBy`, `approvedByRole`, `approvedAt`: Approval tracking
- `isArchived`, `archivedAt`: Soft delete support
- `duplicateOf`: Link to original if duplicate

### Notification
Enhanced notification system.

**New Fields:**
- `title`: Notification title
- `type`: Notification type (info, success, warning, error)
- `audienceDepartment`: Now references Department model
- `readBy`: Detailed read tracking with timestamps
- `actionUrl`: Action URL for notifications
- `relatedResourceType`, `relatedResourceId`: Related resource reference
- `expiresAt`: Optional expiration

### User (Admin)
Enhanced admin user model.

**New Fields:**
- `college`: Reference to College
- `departments`: Managed departments
- `permissions`: Custom permissions
- `lastLogin`, `loginCount`: Login tracking
- `isActive`, `isArchived`, `archivedAt`: Status tracking

## Migration Notes

### Breaking Changes
1. **Department field changes**: Faculty, HOD, and Upload models now use ObjectId references to Department instead of string codes
2. **Category field changes**: Upload now references AchievementCategory instead of using string names
3. **Academic tracking**: Upload now requires academicYear and semester references

### Migration Strategy
1. Run the seed script to create default data: `npm run seed`
2. Migrate existing string department codes to Department references
3. Migrate existing string category names to AchievementCategory references
4. Create default academic year and semester records

## Seed Data

The system includes a comprehensive seeding utility that creates:
- Default departments (CSE, ECE, EEE, AIML, AIDS, IT, MECH, CIVIL, DIPLOMA, CHEM)
- Default achievement categories (20 categories with proper configurations)
- Credit configurations for each category
- System roles (ADMIN, HOD, FACULTY)
- Granular permissions for RBAC
- Current academic year and semesters
- System settings
- Notification templates
- Approval workflows
- Default college

Run seeding with: `npm run seed`

## Security Features

1. **Audit Logging**: All critical actions are logged immutably
2. **Soft Deletes**: Most models support soft deletes for data recovery
3. **RBAC**: Fine-grained permission system
4. **Session Management**: Comprehensive session tracking
5. **Immutable Audit Logs**: Cannot be modified after creation

## Usage Examples

### Creating an Achievement
```javascript
const upload = await Upload.create({
  faculty: facultyId,
  facultyName: "Dr. John Doe",
  department: departmentId,
  departmentName: "CSE",
  college: collegeId,
  category: categoryId,
  categoryName: "Publication",
  academicYear: academicYearId,
  semester: semesterId,
  title: "Research Paper on AI",
  credits: 10,
  basePoints: 10,
  weightage: 1,
  year: 2024,
  status: "FACULTY_SUBMITTED"
});
```

### Querying by Academic Period
```javascript
const achievements = await Upload.find({
  academicYear: currentYearId,
  semester: currentSemesterId,
  status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] }
}).populate('faculty department category');
```

### Audit Logging
```javascript
const { logAudit } = require('./utils/auditLogger');

await logAudit({
  action: 'create',
  resourceType: 'achievement',
  resourceId: upload._id,
  userId: req.user.id,
  userName: req.user.name,
  userRole: req.user.role,
  newValue: upload.toObject(),
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```
