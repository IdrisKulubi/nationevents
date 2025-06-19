# Security Personnel Module

## Overview
The Security Personnel Module provides comprehensive security management capabilities for event verification and incident reporting. This module enables security staff to verify attendees, manage checkpoints, and report incidents in real-time.

## Features Implemented

### ✅ 1. Secure Login with Role-Based Access
- Authentication through existing Next-Auth system
- Role-based access control (only users with `role: "security"`)
- Automatic redirection to setup page for new security personnel
- Session management and security validation

### ✅ 2. PIN Verification Interface
- **6-digit PIN verification** for attendees
- **Ticket number verification** (format: HCS-YYYY-XXXXXXXX)
- Real-time validation and feedback
- Duplicate check-in detection
- Attendee information display after successful verification

### ✅ 3. Manual Ticket Number Verification
- Alternative verification method using ticket numbers
- Format validation for ticket numbers
- Same verification flow as PIN verification
- Audit trail for all verification methods

### ✅ 4. Real-time Attendance Validation
- Immediate database verification
- Check for existing check-ins
- Status tracking (checked_in, checked_out, flagged)
- Verification history and audit trail

### ✅ 5. Incident Reporting System
- Comprehensive incident reporting form
- Multiple incident types: unauthorized_access, suspicious_activity, emergency, technical_issue, other
- Severity levels: low, medium, high, critical
- Location tracking and involved persons logging
- Action taken documentation

### ✅ 6. Access to Attendee Verification History
- Recent verification history display
- Filterable by security personnel
- Detailed verification information including method, time, and status
- Pagination support for large datasets

### ✅ 7. Offline Verification Capability
- Local storage for offline verifications
- Automatic online/offline status detection
- Data export functionality for backup
- Sync capability when connection is restored
- Mobile-optimized interface

### ✅ 8. Multi-checkpoint Support
- Checkpoint assignment system
- Visual checkpoint selector
- Occupancy tracking and capacity management
- Different checkpoint types (entry, exit, booth_area, main_hall, registration)

### ✅ 9. Real-time Communication with Admin
- Incident reports automatically notify administrators
- Real-time status updates
- Centralized incident management
- Audit trail for all security activities

## File Structure

```
src/
├── app/
│   └── security/
│       ├── layout.tsx              # Security layout with navigation
│       ├── page.tsx                # Main security dashboard
│       ├── setup/
│       │   └── page.tsx            # Security personnel setup
│       └── offline/
│           └── page.tsx            # Offline verification interface
├── components/
│   └── security/
│       ├── pin-verification-form.tsx      # PIN/Ticket verification
│       ├── incident-report-form.tsx       # Incident reporting
│       ├── security-stats.tsx             # Dashboard statistics
│       ├── checkpoint-selector.tsx        # Multi-checkpoint support
│       ├── attendance-history.tsx         # Verification history
│       ├── security-setup-form.tsx        # Initial setup form
│       └── offline-verification.tsx       # Offline mode interface
└── app/api/security/
    ├── verify/
    │   └── actions.ts              # PIN/Ticket verification logic
    ├── incidents/
    │   └── actions.ts              # Incident reporting logic
    └── setup/
        └── actions.ts              # Security profile setup
```

## Database Schema

The module uses the following existing database tables:

- **`securityPersonnel`** - Security staff profiles and assignments
- **`attendanceRecords`** - Verification and check-in records
- **`securityIncidents`** - Incident reports and tracking
- **`checkpoints`** - Checkpoint definitions and management
- **`users`** - User authentication and roles
- **`jobSeekers`** - Attendee information and PINs
- **`events`** - Event management and active event tracking

## Usage Instructions

### For Security Personnel

1. **Initial Setup**
   - Login with security role account
   - Complete security profile setup (badge number, department, clearance level)
   - Access granted to security dashboard

2. **Daily Operations**
   - **Dashboard**: View daily statistics and recent activity
   - **PIN Verification**: Verify attendees using 6-digit PINs
   - **Ticket Verification**: Verify attendees using ticket numbers
   - **Incident Reporting**: Report security incidents with details
   - **Checkpoint Management**: Select and manage assigned checkpoints

3. **Offline Mode**
   - Access `/security/offline` for offline verification
   - Verifications stored locally when offline
   - Export data for backup purposes
   - Automatic sync when connection restored

### For Administrators

1. **Security Personnel Management**
   - Assign security role to users
   - Manage checkpoint assignments
   - Review incident reports
   - Monitor verification statistics

2. **System Configuration**
   - Configure active events
   - Manage checkpoint definitions
   - Set up notification systems
   - Review audit trails

## Security Features

- **Role-based access control** - Only security personnel can access
- **Session validation** - Continuous authentication checks
- **Audit trail** - All actions logged with timestamps
- **Data validation** - Input validation for all forms
- **Offline capability** - Works without network connectivity
- **Real-time updates** - Immediate feedback and status updates

## API Endpoints

- `POST /api/security/verify` - PIN and ticket verification
- `POST /api/security/incidents` - Incident reporting
- `POST /api/security/setup` - Security profile setup

## Mobile Optimization

- Responsive design for mobile devices
- Touch-friendly interface
- Offline-first approach
- Large input fields for easy PIN entry
- Quick action buttons

## Future Enhancements

- QR code scanning capability
- Push notifications for incidents
- Advanced reporting and analytics
- Integration with external security systems
- Biometric verification support
- Real-time chat with admin
- GPS location tracking for incidents

## Testing

To test the security module:

1. Create a user with `role: "security"`
2. Login and complete security setup
3. Test PIN verification with valid 6-digit PINs
4. Test ticket verification with format HCS-YYYY-XXXXXXXX
5. Submit test incident reports
6. Test offline mode by disconnecting internet
7. Verify data persistence and export functionality
