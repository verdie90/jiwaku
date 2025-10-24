# Firestore Demo Data Seeding Guide

## Overview

This guide provides step-by-step instructions for seeding your Firestore database with comprehensive demo data for testing the Jiwaku CRM Ticket Management System.

The `seed-firestore.js` script populates your Firestore database with:
- ✅ 1 Team with 6 members
- ✅ 5 Contacts with various communication channels
- ✅ 8 Tickets with different statuses, priorities, and assignments
- ✅ 6 Users/Agents with various roles

This data is designed to represent a realistic support ticket workflow with different ticket states (open, in_progress, waiting, resolved, closed) and realistic customer interactions.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Demo Data Overview](#demo-data-overview)
4. [Detailed Setup Steps](#detailed-setup-steps)
5. [Running the Seed Script](#running-the-seed-script)
6. [Verifying the Data](#verifying-the-data)
7. [Testing the Dashboard](#testing-the-dashboard)
8. [Cleanup & Reset](#cleanup--reset)
9. [Troubleshooting](#troubleshooting)
10. [Alternative Approaches](#alternative-approaches)

---

## Prerequisites

Before running the seed script, ensure you have:

- ✅ **Node.js** v18 or higher installed
- ✅ **npm** or **yarn** package manager
- ✅ **Firebase Admin SDK** installed (`npm install firebase-admin`)
- ✅ **Firebase project** created and Firestore database initialized
- ✅ **Service account key** downloaded from Firebase Console
- ✅ **GOOGLE_APPLICATION_CREDENTIALS** environment variable configured

### Installation Check

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Firebase Admin SDK
npm list firebase-admin
```

---

## Quick Start

If you have everything set up, you can seed data in 2 steps:

### Step 1: Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
```

**macOS/Linux:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Step 2: Run the Seed Script

```bash
node scripts/seed-firestore.js
```

You should see:
```
✅ Team "Support Team" created
✅ Contact "John Doe" created
✅ Contact "Jane Smith" created
... (more contacts, tickets, users)
✨ All demo data has been seeded to Firestore!
```

**That's it!** Your Firestore now has demo data. Jump to [Testing the Dashboard](#testing-the-dashboard).

---

## Demo Data Overview

### Team Structure

```
Team: Support Team
├── Owner: Admin User (user-1)
├── Members: 6 (admins, leads, agents, specialists)
└── Settings: UTC timezone, English, max 10 agents
```

### Contacts (5 Total)

| ID | Name | Company | Industry | Channels |
|----|------|---------|----------|----------|
| contact-1 | John Doe | Tech Corp | Technology | Email |
| contact-2 | Jane Smith | Design Studio | Design | Email, WhatsApp |
| contact-3 | Bob Johnson | Marketing Inc | Marketing | Email |
| contact-4 | Alice Williams | StartUp Co | Tech | Email, WhatsApp |
| contact-5 | Charlie Brown | Enterprise Solutions | Enterprise | Email |

### Ticket Distribution

**By Status:**
- Open: 3 tickets (TKT-001, TKT-006, TKT-008)
- In Progress: 2 tickets (TKT-002, TKT-007)
- Waiting: 1 ticket (TKT-003)
- Resolved: 1 ticket (TKT-004)
- Closed: 1 ticket (TKT-005)

**By Priority:**
- Urgent: 1 ticket (TKT-002)
- High: 3 tickets (TKT-001, TKT-004, TKT-007)
- Medium: 2 tickets (TKT-003, TKT-006)
- Low: 2 tickets (TKT-005, TKT-008)

**By Category:**
- Technical: 3 tickets
- Performance: 2 tickets
- Mobile: 1 ticket
- Documentation: 1 ticket
- API: 1 ticket

### Sample Tickets

#### TKT-001: Login page not loading
- **Status:** Open
- **Priority:** High
- **Contact:** John Doe (Tech Corp)
- **Description:** Users unable to load the login page. Getting blank screen.
- **Comments:** 2 (1 external, 1 internal)
- **SLA Status:** Within (60 min response, 240 min resolution)

#### TKT-002: Payment processing delays
- **Status:** In Progress
- **Priority:** Urgent
- **Contact:** Jane Smith (Design Studio)
- **Assigned:** agent-1
- **Description:** Customers experiencing significant payment confirmation delays.
- **Comments:** 2 (both internal)
- **SLA Status:** Within (15 min response, 120 min resolution)

#### TKT-003: Email notifications not received
- **Status:** Waiting
- **Priority:** Medium
- **Contact:** Bob Johnson (Marketing Inc)
- **Assigned:** agent-2
- **Description:** Users not receiving email notifications after registration.
- **Comments:** 1 (external)
- **SLA Status:** Within (120 min response, 480 min resolution)

#### TKT-004: Mobile app crashes on startup
- **Status:** Resolved
- **Priority:** High
- **Contact:** Alice Williams (StartUp Co)
- **Assigned:** agent-3
- **Description:** iOS app crashes immediately when launching on iOS 16+.
- **Comments:** 2 (mix of internal and external)
- **Resolved At:** 12 hours ago

#### TKT-005: API rate limiting too restrictive
- **Status:** Closed
- **Priority:** Low
- **Contact:** Charlie Brown (Enterprise Solutions)
- **Assigned:** agent-1
- **Description:** Requesting rate limit increase from 100 to 1000 req/min.
- **Resolved & Closed:** 2 days ago

#### Additional Tickets: TKT-006, TKT-007, TKT-008
- Various realistic support scenarios
- Different timestamps and SLA states
- Multiple comment types (internal/external)

### Users/Agents (6 Total)

| ID | Email | Role | Department | Status |
|----|-------|------|-----------|--------|
| user-1 | admin@jiwaku.com | Admin | Management | Available |
| user-2 | agent1@jiwaku.com | Agent | Support | Available |
| user-3 | agent2@jiwaku.com | Agent | Support | Busy |
| agent-1 | team-lead1@jiwaku.com | Lead | Support | Available |
| agent-2 | team-lead2@jiwaku.com | Lead | Support | Available |
| agent-3 | specialist@jiwaku.com | Agent | Technical | Available |

---

## Detailed Setup Steps

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Settings** (gear icon in top left)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download - **Keep this file safe!**
7. Save it locally (e.g., `firebaseKey.json` in your project root)

### Step 2: Install Firebase Admin SDK

```bash
cd d:\Github\aicrm\jiwaku
npm install firebase-admin
```

Expected output:
```
added firebase-admin@12.x.x
```

### Step 3: Configure Environment Variable

Choose your operating system:

#### Windows (PowerShell)

```powershell
# Set environment variable for current session
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\firebaseKey.json"

# Verify it's set
$env:GOOGLE_APPLICATION_CREDENTIALS
```

#### Windows (Command Prompt)

```cmd
# Set environment variable
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\firebaseKey.json

# Verify it's set
echo %GOOGLE_APPLICATION_CREDENTIALS%
```

#### macOS/Linux (Bash)

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebaseKey.json"

# Verify it's set
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### Step 4: Verify Firestore Security Rules

Ensure your Firestore security rules allow writes during development:

```javascript
// DEVELOPMENT ONLY - Allow all reads/writes (temporary)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```

**⚠️ WARNING:** This is development-only. Use proper security rules in production!

See `FIRESTORE_SETUP_GUIDE.md` for production security rules.

---

## Running the Seed Script

### Command Line Execution

```bash
# From project root directory
node scripts/seed-firestore.js
```

### Expected Output

```
🔧 Initializing Firebase Admin SDK...
✅ Firebase Admin SDK initialized

🌱 Starting Firestore Demo Data Seeding...

📁 Seeding Teams...
✅ Team "Support Team" created

👥 Seeding Contacts...
✅ Contact "John Doe" created
✅ Contact "Jane Smith" created
✅ Contact "Bob Johnson" created
✅ Contact "Alice Williams" created
✅ Contact "Charlie Brown" created

🎫 Seeding Tickets...
✅ Ticket "Login page not loading" created
✅ Ticket "Payment processing delays" created
✅ Ticket "Email notifications not received" created
✅ Ticket "Mobile app crashes on startup" created
✅ Ticket "API rate limiting too restrictive" created
✅ Ticket "Dashboard performance improvement" created
✅ Ticket "Two-factor authentication not working" created
✅ Ticket "Documentation outdated" created

👤 Seeding Users...
✅ User "Admin User" created
✅ User "Support Agent 1" created
✅ User "Support Agent 2" created
✅ User "Team Lead 1" created
✅ User "Team Lead 2" created
✅ User "Technical Specialist" created

📊 Seeding Complete!

Summary:
ℹ️  Teams: 1
ℹ️  Contacts: 5
ℹ️  Tickets: 8
ℹ️  Users: 6

✨ All demo data has been seeded to Firestore!

You can now test the application with realistic demo data.

Next steps:
1. Start development server: npm run dev
2. Navigate to: http://localhost:3000/dashboard/tickets
3. You should see 8 demo tickets with various statuses
4. Create new tickets, update statuses, add comments, and test all features
```

### Execution Troubleshooting

If you see errors:

**"GOOGLE_APPLICATION_CREDENTIALS environment variable not set"**
```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"

# Then try again
node scripts/seed-firestore.js
```

**"Service account key not found"**
```bash
# Verify the file path is correct
dir C:\path\to\serviceAccountKey.json
# Or on Linux/macOS
ls -la /path/to/serviceAccountKey.json
```

**"Permission denied" errors**
- Check Firestore security rules (must allow writes)
- Verify service account has proper permissions
- Check Firebase Console for error details

---

## Verifying the Data

### Method 1: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database** in left menu
4. Click **Data** tab
5. Expand collections and verify:
   - `teams` → `team-1` → `contacts`, `tickets`, `users`
   - Each collection should show the seeded documents

### Method 2: Using Firestore CLI

```bash
# List all documents in teams collection
firebase firestore:list teams

# List all tickets
firebase firestore:list teams/team-1/tickets

# View a specific ticket
firebase firestore:get teams/team-1/tickets/TKT-001
```

### Method 3: Application Console Verification

Check browser console for data loading:

```javascript
// In browser console
firebase.firestore().collection('teams').doc('team-1').collection('tickets').get()
  .then(snap => console.log('Found', snap.size, 'tickets'))
```

### Verification Checklist

- ✅ Teams collection exists with "team-1" document
- ✅ Each team has "contacts", "tickets", "users" subcollections
- ✅ 5 contacts created (contact-1 through contact-5)
- ✅ 8 tickets created (TKT-001 through TKT-008)
- ✅ 6 users created with correct roles
- ✅ Tickets have proper nested comments
- ✅ SLA data populated with timestamps
- ✅ Contact relationships are correct
- ✅ Agent assignments are set

---

## Testing the Dashboard

### Step 1: Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.1.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.8s
```

### Step 2: Navigate to Ticket Dashboard

Open browser and go to:
```
http://localhost:3000/dashboard/tickets
```

### Step 3: Verify Dashboard Display

You should see:

**Left Panel (Ticket List):**
- 8 tickets total
- Status badges (Open, In Progress, Waiting, Resolved, Closed)
- Priority colors (Red for High/Urgent, Yellow for Medium, Green for Low)
- Search functionality working

**Middle Panel (Ticket Details):**
- Selected ticket shows full information
- Comments section displays (both internal and external)
- SLA information displayed with visual indicators

**Right Panel (Create/Edit Form):**
- Form for creating new tickets
- Dropdown for contact selection
- Status and priority selectors

### Step 4: Test Core Functionality

#### Test 1: View Ticket Details
1. Click on a ticket in the left panel
2. Verify all information displays correctly
3. Check that comments show with author names and timestamps

#### Test 2: Create New Ticket
1. Fill the form on the right panel
2. Select a contact from dropdown
3. Enter title and description
4. Select status and priority
5. Click "Create Ticket"
6. New ticket should appear in the list with a new ID

#### Test 3: Update Ticket Status
1. Click on a ticket
2. Change the status dropdown
3. Click "Update"
4. Verify status changes in Firestore Console

#### Test 4: Add Comment
1. Click on a ticket
2. Scroll to comments section
3. Add a new comment
4. Verify it appears immediately in the list

#### Test 5: Search Tickets
1. Use search box in the left panel
2. Type a keyword (e.g., "login", "payment")
3. Results should filter in real-time
4. Clear search to see all tickets again

### Step 5: Verify Real-Time Sync

Open Firestore Console in another browser tab:
1. Navigate to Firebase Console → Firestore Database
2. Create a ticket in the app
3. Watch the Firestore Console - new document should appear immediately
4. Update a ticket status in the app
5. Watch the Firestore Console - document should update in real-time

---

## Cleanup & Reset

### Delete All Demo Data

If you want to start fresh, you can delete all data from Firestore:

#### Option 1: Using Firestore Console

1. Go to Firebase Console → Firestore Database
2. Click the "Data" tab
3. Right-click on the `teams` collection
4. Select "Delete collection"
5. Confirm deletion
6. Run the seed script again to repopulate

#### Option 2: Using Firebase CLI

```bash
# Delete teams collection and all subcollections
firebase firestore:delete teams --recursive
```

#### Option 3: Create a Reset Script

Create `scripts/reset-firestore.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(path, batchSize = 100) {
  const source = db.collection(path);
  let query = source;

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.limit(batchSize).onSnapshot(snapshot => {
    if (snapshot.size === 0) {
      resolve();
      return;
    }

    let batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.commit().then(() => {
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
    }).catch(reject);
  }, reject);
}

deleteCollection('teams')
  .then(() => {
    console.log('✅ All data deleted successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error deleting data:', err);
    process.exit(1);
  });
```

Then run:
```bash
node scripts/reset-firestore.js
```

### Selective Cleanup

Delete only specific collections:

```bash
# Delete only tickets
firebase firestore:delete teams/team-1/tickets --recursive

# Delete only contacts
firebase firestore:delete teams/team-1/contacts --recursive
```

---

## Troubleshooting

### Problem: "GOOGLE_APPLICATION_CREDENTIALS environment variable not set"

**Solution:**
```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"

# macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Then run script again
node scripts/seed-firestore.js
```

### Problem: "Service account key not found"

**Solution:**
1. Verify the path is absolute, not relative
2. Check the file exists: `ls -la /path/to/file`
3. Ensure no typos in the path
4. Try using absolute path without ~ expansion on macOS/Linux

### Problem: "Permission denied" error from Firestore

**Solution:**
Check security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write; // Temporary for development
    }
  }
}
```

### Problem: "Cannot find module 'firebase-admin'"

**Solution:**
```bash
npm install firebase-admin
npm install --save firebase-admin  # Save to package.json
```

### Problem: Dashboard shows "Loading..." indefinitely

**Solution:**
1. Check browser console for errors (F12)
2. Verify .env.local has correct Firebase credentials
3. Check Firestore security rules allow reads
4. Verify Firestore database is initialized
5. Clear browser cache and refresh

### Problem: Data not appearing in Firestore Console

**Solution:**
1. Wait 30 seconds (console may need time to refresh)
2. Press F5 to refresh Firestore Console page
3. Check the script completed successfully (look for ✨ message)
4. Verify correct Firebase project is selected

### Problem: Script runs but shows no output

**Solution:**
1. Add debug output: `node --trace-warnings scripts/seed-firestore.js`
2. Check Node.js version: `node --version` (should be v18+)
3. Try with explicit project ID:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id node scripts/seed-firestore.js
   ```

---

## Alternative Approaches

### Manual Data Creation

If you prefer to create data manually through the Firebase Console:

1. Go to Firebase Console → Firestore Database
2. Click **Start Collection** → Create "teams"
3. Add document "team-1" with team data
4. Create subcollections "contacts", "tickets", "users"
5. Add documents manually using the UI

**Pros:** Understand Firestore structure better
**Cons:** Time-consuming, error-prone

### Bulk Import via Firebase Admin UI

Use Firebase's Firestore UI extensions:

```bash
# Install extension
firebase ext:install firebase/firestore-bulk-import --project=your-project

# Import from JSON file (requires special format)
```

### Custom Data Generation

Create your own seed data script:

```javascript
// scripts/custom-seed.js
const admin = require('firebase-admin');
// ... initialization code ...

// Generate 100 random tickets
for (let i = 0; i < 100; i++) {
  const ticket = {
    title: `Ticket ${i}`,
    description: 'Generated ticket',
    status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
    // ... more fields
  };
  // Add to Firestore
}
```

### Integration with Database Migration Tools

For production migrations from other databases:

1. Export data from source database
2. Transform to Firestore format
3. Use Admin SDK for bulk import
4. See `FIRESTORE_INTEGRATION_GUIDE.md` for migration details

---

## Next Steps

After seeding demo data:

1. **Test CRUD Operations**
   - ✅ Create tickets (already done - verify in dashboard)
   - ✅ Read tickets (already done - viewing in dashboard)
   - ✅ Update tickets (change status, add comments)
   - ✅ Delete tickets (use dashboard or console)

2. **Test Advanced Features**
   - Search and filter tickets
   - Assign tickets to agents
   - View agent workload
   - Track SLA metrics
   - Real-time comment updates

3. **Prepare for Production**
   - Implement proper security rules
   - Set up database backups
   - Configure CI/CD for automation
   - Set up monitoring and logging
   - Document data retention policies

4. **Continue Development**
   - Phase 3C: Advanced ticket features
   - Phase 4: Analytics and reporting
   - Phase 5: Automation and workflows
   - Phase 6: Integration and APIs

---

## Support & Resources

- **Firebase Documentation:** https://firebase.google.com/docs/firestore
- **Firebase Admin SDK:** https://firebase.google.com/docs/database/admin/start
- **Firestore Best Practices:** https://firebase.google.com/docs/firestore/best-practices
- **Security Rules Guide:** https://firebase.google.com/docs/firestore/security/overview
- **Project Repository:** `d:\Github\aicrm\jiwaku`
- **Related Guides:**
  - `FIRESTORE_INTEGRATION_GUIDE.md` - API documentation and usage
  - `FIRESTORE_SETUP_GUIDE.md` - Initial Firestore setup
  - `README.md` - Project overview

---

## Quick Reference

### Common Commands

```bash
# Setup
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Seed data
node scripts/seed-firestore.js

# Start development
npm run dev

# View in browser
http://localhost:3000/dashboard/tickets

# Reset data
firebase firestore:delete teams --recursive
node scripts/seed-firestore.js
```

### Data Structure Quick Reference

```
Firestore Root
└── teams (collection)
    └── team-1 (document)
        ├── (team data)
        ├── contacts (subcollection)
        │   ├── contact-1
        │   ├── contact-2
        │   └── ... (5 total)
        ├── tickets (subcollection)
        │   ├── TKT-001
        │   ├── TKT-002
        │   └── ... (8 total)
        └── users (subcollection)
            ├── user-1
            ├── agent-1
            └── ... (6 total)
```

### Expected Metrics

- **Seed Time:** ~5-10 seconds
- **Data Size:** ~500 KB total
- **Documents Created:** 20 (1 team + 5 contacts + 8 tickets + 6 users)
- **Collections:** 4 (teams + 3 subcollections)
- **Reads Required:** 0 (write-only operation)
- **Writes Required:** 20

---

## Version History

- **v1.0** (Current) - Initial seed script with 8 demo tickets, 5 contacts, 6 users
- **v1.1** (Planned) - Support for custom data templates
- **v1.2** (Planned) - Batch import from CSV/JSON
- **v2.0** (Planned) - Production data setup wizard

---

**Happy testing!** 🚀

Once you've verified the demo data is working, proceed to the next phase of development or test your implemented features in a realistic environment.
