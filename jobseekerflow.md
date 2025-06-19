# Job Seeker Flow Refactoring Plan

## 📋 Overview
This document outlines the comprehensive plan to refactor the job seeker registration and booth assignment flow. The new approach will collect all job seeker registrations first, then manually assign booths based on actual registration data to optimize interview scheduling.

## 🎯 Key Changes Required

### 1. **Registration Phase Changes**
- **Remove time slot selection** from the onboarding process
- **Remove booth assignment** during registration
- Focus on collecting complete job seeker profiles and preferences
- Maintain PIN generation and basic notifications

### 2. **Manual Booth Assignment Phase**
- Admin reviews all collected registrations
- Manual booth assignment based on:
  - Job seeker skills and interests
  - Company requirements and available positions
  - Optimal distribution to avoid over/under-booking
- Bulk notification system for interview assignments

### 3. **Notification System Enhancement**
- Bulk email notifications for booth assignments
- Bulk SMS notifications for interview schedules
- Template-based messaging system

## 🔄 New Workflow

### Phase 1: Registration Collection (Current → Modified)
```
Job Seeker Registration → Profile Creation → PIN Generation → Welcome Notification
```

**What Changes:**
- ❌ Remove: Time slot selection UI
- ❌ Remove: Booth preference selection
- ❌ Remove: Interview time booking
- ✅ Keep: All profile information collection
- ✅ Keep: Skills, experience, education data
- ✅ Keep: CV upload and basic preferences
- ✅ Keep: PIN generation and welcome messages

### Phase 2: Admin Review & Assignment (New)
```
Admin Dashboard → Review Registrations → Manual Booth Assignment → Bulk Notifications
```

**New Features:**
- Admin interface to view all registrations by skills/categories
- Booth assignment interface with drag-and-drop or selection
- Bulk assignment tools for efficient distribution
- Preview and confirmation before sending notifications

### Phase 3: Notification Distribution (Enhanced)
```
Bulk Email Generation → Bulk SMS Generation → Delivery Tracking → Confirmation
```

**Enhanced Features:**
- Template-based email/SMS with booth and time details
- Bulk sending with delivery tracking
- Retry mechanism for failed deliveries
- Comprehensive reporting

## 🛠️ Technical Implementation Plan

### 1. Database Schema Updates

#### New Tables Required:
```sql
-- Booth Assignments (New)
CREATE TABLE booth_assignments (
  id TEXT PRIMARY KEY,
  job_seeker_id TEXT NOT NULL REFERENCES job_seeker(id),
  booth_id TEXT NOT NULL REFERENCES booth(id),
  interview_slot_id TEXT REFERENCES interview_slot(id),
  assigned_by TEXT NOT NULL REFERENCES users(id), -- Admin who made assignment
  assigned_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bulk Notifications (New)
CREATE TABLE bulk_notifications (
  id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'both')),
  template_type TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Notification Recipients (New)
CREATE TABLE notification_recipients (
  id TEXT PRIMARY KEY,
  bulk_notification_id TEXT NOT NULL REFERENCES bulk_notifications(id),
  job_seeker_id TEXT NOT NULL REFERENCES job_seeker(id),
  booth_assignment_id TEXT REFERENCES booth_assignments(id),
  email_status TEXT DEFAULT 'pending',
  sms_status TEXT DEFAULT 'pending',
  email_sent_at TIMESTAMP,
  sms_sent_at TIMESTAMP,
  email_error TEXT,
  sms_error TEXT
);
```

#### Modified Tables:
```sql
-- Remove time-related fields from job_seeker table (if any)
-- Add new fields for better categorization
ALTER TABLE job_seeker ADD COLUMN priority_level TEXT DEFAULT 'normal';
ALTER TABLE job_seeker ADD COLUMN assignment_status TEXT DEFAULT 'unassigned';
```

### 2. Component Refactoring

#### A. Registration Form Updates
**File:** `src/components/profile/profile-setup-form.tsx`

**Changes Required:**
- Remove time preference selection step
- Remove booth selection components
- Simplify to 3 steps: Personal Info → Career Details → Upload & Submit
- Update form validation to remove time-related fields
- Modify success message to indicate "registration complete, assignment pending"

#### B. New Admin Components

**New File:** `src/components/admin/booth-assignment-interface.tsx`
```typescript
// Features:
// - View all unassigned job seekers
// - Filter by skills, experience, education
// - Drag-and-drop or bulk selection for booth assignment
// - Preview assignment before confirmation
// - Bulk assignment tools
```

**New File:** `src/components/admin/bulk-notification-manager.tsx`
```typescript
// Features:
// - Create notification campaigns
// - Select recipients (all assigned, specific booths, custom selection)
// - Template selection and customization
// - Preview notifications
// - Send and track delivery status
```

**New File:** `src/components/admin/assignment-dashboard.tsx`
```typescript
// Features:
// - Overview of registration vs assignment status
// - Statistics by booth, skills, experience level
// - Assignment progress tracking
// - Quick actions for common tasks
```

#### C. Updated Admin Pages

**Modified File:** `src/app/admin/users/jobseekers/page.tsx`
- Add assignment status column
- Add bulk assignment actions
- Add notification sending capabilities
- Filter by assignment status

### 3. Server Actions Updates

#### A. Modified Actions
**File:** `src/lib/actions/user-actions.ts`

**Function:** `createJobSeekerProfile()`
```typescript
// Remove: timePreference field
// Remove: booth assignment logic
// Keep: All other profile creation logic
// Update: Success response to indicate pending assignment
```

#### B. New Actions
**New File:** `src/lib/actions/booth-assignment-actions.ts`
```typescript
// assignJobSeekerToBooth()
// bulkAssignJobSeekers()
// getUnassignedJobSeekers()
// getAssignmentStatistics()
// updateAssignmentStatus()
```

**New File:** `src/lib/actions/bulk-notification-actions.ts`
```typescript
// createNotificationCampaign()
// sendBulkAssignmentNotifications()
// trackNotificationDelivery()
// getNotificationStatistics()
// retryFailedNotifications()
```

### 4. API Routes Updates

#### New API Routes:
```
/api/admin/booth-assignments/
├── assign - POST: Assign job seeker to booth
├── bulk-assign - POST: Bulk assignment
├── unassigned - GET: Get unassigned job seekers
└── statistics - GET: Assignment statistics

/api/admin/notifications/
├── campaigns - GET/POST: Manage campaigns
├── send-bulk - POST: Send bulk notifications
├── status - GET: Check delivery status
└── retry - POST: Retry failed notifications
```

### 5. Email & SMS Template Updates

#### New Email Templates:
**File:** `src/lib/email-templates/booth-assignment.tsx`
```typescript
// Template for booth assignment notification
// Include: Booth details, interview time, preparation instructions
// Include: Event details, contact information, next steps
```

#### New SMS Templates:
**File:** `src/lib/constants/sms-templates.ts`
```typescript
BOOTH_ASSIGNMENT: {
  template: (name: string, boothNumber: string, companyName: string, date: string, time: string) =>
    `🎉 Hi ${name}! You're assigned to Booth ${boothNumber} (${companyName}) on ${date} at ${time}. Good luck! 🚀`
}
```

## 📅 Implementation Timeline

### Week 1: Database & Core Infrastructure
- [ ] Create new database tables
- [ ] Update existing schema
- [ ] Create migration scripts
- [ ] Test database changes

### Week 2: Backend Services
- [ ] Implement booth assignment actions
- [ ] Create bulk notification system
- [ ] Update existing user actions
- [ ] Create new API routes
- [ ] Test all server functions

### Week 3: Admin Interface
- [ ] Build booth assignment interface
- [ ] Create bulk notification manager
- [ ] Update admin dashboard
- [ ] Add assignment statistics
- [ ] Test admin workflows

### Week 4: Frontend Updates & Integration
- [ ] Update registration form
- [ ] Remove time selection components
- [ ] Update success messages
- [ ] Create email/SMS templates
- [ ] Integration testing

### Week 5: Testing & Deployment
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Documentation updates
- [ ] Production deployment

## 🔧 Configuration Changes

### Environment Variables:
```env
# Bulk notification settings
BULK_EMAIL_BATCH_SIZE=50
BULK_SMS_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=300000

# Assignment settings
MAX_ASSIGNMENTS_PER_BOOTH=20
ASSIGNMENT_BUFFER_TIME=30
```

### Feature Flags:
```typescript
// For gradual rollout
ENABLE_MANUAL_ASSIGNMENTS=true
ENABLE_BULK_NOTIFICATIONS=true
DISABLE_TIME_SELECTION=true
```

## 🚨 Risk Mitigation

### 1. Data Migration Risks
- **Risk:** Existing registrations with time preferences
- **Mitigation:** Migration script to preserve data, mark as "legacy"
- **Rollback:** Keep old fields for rollback capability

### 2. Notification Delivery Risks
- **Risk:** Bulk email/SMS failures
- **Mitigation:** Batch processing, retry mechanisms, delivery tracking
- **Monitoring:** Real-time delivery status dashboard

### 3. Admin Workflow Risks
- **Risk:** Complex assignment interface overwhelming admins
- **Mitigation:** Progressive disclosure, guided workflows, bulk tools
- **Training:** Admin training documentation and video guides

### 4. User Experience Risks
- **Risk:** Job seekers confused by new process
- **Mitigation:** Clear communication, updated help text, FAQ updates
- **Support:** Enhanced support documentation

## 📊 Success Metrics

### Registration Phase:
- Registration completion rate (target: >95%)
- Profile completeness score (target: >90%)
- Time to complete registration (target: <10 minutes)

### Assignment Phase:
- Assignment completion time (target: <2 hours for 100 registrations)
- Assignment accuracy (target: >95% appropriate matches)
- Admin satisfaction with assignment tools

### Notification Phase:
- Email delivery rate (target: >98%)
- SMS delivery rate (target: >95%)
- Notification open/read rates
- Job seeker confirmation rates

## 🔄 Rollback Plan

### Phase 1: Immediate Rollback (if critical issues)
- Revert to previous registration form
- Disable new assignment interface
- Use manual email/SMS sending

### Phase 2: Partial Rollback (if specific features fail)
- Keep new registration form
- Fallback to manual assignment process
- Use existing notification system

### Phase 3: Data Recovery
- Preserve all registration data
- Export assignment data
- Maintain notification logs

## 📝 Documentation Updates Required

1. **Admin User Guide:** New assignment and notification workflows
2. **Job Seeker Guide:** Updated registration process
3. **API Documentation:** New endpoints and data structures
4. **Deployment Guide:** Migration steps and configuration
5. **Troubleshooting Guide:** Common issues and solutions

## 🎯 Next Steps

1. **Stakeholder Review:** Present this plan for approval
2. **Technical Review:** Architecture and implementation review
3. **Resource Allocation:** Assign development team members
4. **Timeline Confirmation:** Confirm delivery dates
5. **Risk Assessment:** Final risk review and mitigation plans

---

**Note:** This plan prioritizes data integrity, user experience, and system reliability while implementing the requested changes efficiently. The phased approach allows for testing and validation at each step.
