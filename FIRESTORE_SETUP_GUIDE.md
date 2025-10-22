# Firestore Setup & Data Integration Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Console Setup](#firebase-console-setup)
3. [Environment Configuration](#environment-configuration)
4. [Security Rules](#security-rules)
5. [Data Initialization](#data-initialization)
6. [Testing Integration](#testing-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:

- ✅ Node.js v18+ installed
- ✅ npm or yarn package manager
- ✅ Firebase project created
- ✅ Access to Firebase Console
- ✅ Admin SDK credentials (for data initialization)
- ✅ Code repository cloned locally

---

## 🎯 Firebase Console Setup

### Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Navigate to **Firestore Database** in the left menu
4. Click **Create database**
5. **Select location**: Choose closest region to your users
6. **Select mode**: Choose **Production mode** (with custom rules)
7. Click **Create**

### Step 2: Verify Collection Creation

Once created, verify Firestore is ready:
- You should see an empty Firestore database
- No collections or documents yet (we'll add them)
- Navigate to **Data** tab to confirm

### Step 3: Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon)
2. Navigate to **Your apps** section
3. Find your web app and click **<>** (web icon)
4. Copy the `firebaseConfig` object
5. We'll use this in the next step

---

## 🌍 Environment Configuration

### Step 1: Create `.env.local` File

In your project root, create `.env.local`:

```env
# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Optional: Emulator (for local development)
# NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

### Step 2: Update Firebase Config File

Update `lib/firebase/config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### Step 3: Verify Configuration

```bash
# Test Firebase initialization
npm run dev

# Check browser console for any Firebase errors
# You should see: "Firebase initialized successfully"
```

---

## 🔐 Security Rules

### Step 1: Update Security Rules in Console

1. In Firebase Console, go to **Firestore Database**
2. Click **Rules** tab
3. Replace existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teams collection
    match /teams/{teamId} {
      // Tickets subcollection - Allow read for team members
      match /tickets/{ticketId} {
        allow list: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow get: if request.auth != null &&
                      request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow update: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow delete: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
      }
      
      // Contacts subcollection
      match /contacts/{contactId} {
        allow list: if request.auth != null;
        allow get: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
      
      // Users subcollection
      match /users/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
}
```

### Step 2: Test Rules

1. Click **Rules simulator** button
2. Test with sample data
3. Verify read/write permissions work

### Step 3: Publish Rules

1. Click **Publish** button
2. Confirm the action
3. Rules are now live

---

## 💾 Data Initialization

### Option A: Automated Initialization (Recommended)

#### Step 1: Get Admin SDK Credentials

1. Go to Firebase Console → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file as `firebase-admin-key.json` in project root
4. **DO NOT commit this file** (add to `.gitignore`)

#### Step 2: Add to .gitignore

```bash
# Already in .gitignore, verify:
echo "firebase-admin-key.json" >> .gitignore
```

#### Step 3: Run Initialization Script

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="firebase-admin-key.json"

# Run initialization script
node scripts/init-firestore-data.js
```

#### Expected Output

```
🚀 Starting Firestore data initialization...

📁 Creating team document...
✅ Team created

🎫 Adding sample tickets...
✅ 4 tickets created

👥 Adding sample contacts...
✅ 4 contacts created

👤 Adding sample users...
✅ 4 users created

✨ Firestore initialization complete!

📊 Summary:
  • Team: team-1
  • Tickets: 4
  • Contacts: 4
  • Users: 4

🎉 All sample data has been added to Firestore!
```

### Option B: Manual Initialization via Console

If you prefer manual setup:

1. Go to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. Create collection named `teams`
4. Add document with ID `team-1`
5. Add fields manually (see schema below)

### Data Schema Reference

#### Team Document
```json
{
  "name": "Development Team",
  "description": "Sample development team",
  "ownerId": "user-1",
  "members": ["user-1", "user-2", "agent-1", "agent-2"],
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

#### Ticket Document
```json
{
  "teamId": "team-1",
  "contactId": "contact-1",
  "title": "Login page not loading",
  "description": "Users unable to access login page",
  "status": "open",
  "priority": "high",
  "assignedAgentId": "agent-1",
  "tags": ["website", "critical"],
  "categories": ["Technical"],
  "comments": [...],
  "sla": {...},
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## ✅ Testing Integration

### Test 1: Verify Firestore Connection

```typescript
// In browser console or test file
import { getFirebaseFirestore } from '@/lib/firebase/client';

const db = getFirebaseFirestore();
console.log('Firestore connected:', db);
```

### Test 2: Read Tickets

```bash
# Visit http://localhost:3000/dashboard/tickets
# Should display "Loading tickets from Firestore..."
# Then show 4 sample tickets
```

### Test 3: Create New Ticket

1. Click **New** button
2. Fill in form:
   - Title: "Test Ticket"
   - Description: "This is a test"
   - Status: "open"
   - Priority: "high"
3. Click **Create Ticket**
4. Should see success notification
5. Go to **Firestore Console** → **Data** tab
6. Verify new document appeared in `teams/team-1/tickets/`

### Test 4: Update Ticket

1. Click on a ticket to view details
2. Click **Edit** button
3. Change status to "in_progress"
4. Click **Update Ticket**
5. Verify change in Firestore console

### Test 5: Delete Ticket

1. Select a ticket
2. Click **Delete** button
3. Confirm deletion
4. Verify document removed from Firestore

---

## 🐛 Troubleshooting

### Issue: "Permission denied" Error

**Symptoms**: Cannot read/write to Firestore

**Solutions**:
```bash
# 1. Check security rules in Console
#    Firebase Console → Firestore → Rules tab

# 2. Verify user authentication
#    Check browser console for auth errors

# 3. Test with unsecure rules (dev only!)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

# 4. Restart development server
npm run dev
```

### Issue: "Collection not found" Error

**Symptoms**: Cannot find `teams/team-1/tickets`

**Solutions**:
```bash
# 1. Verify collection exists in Console
#    Firestore Database → Data tab

# 2. Check team ID matches:
#    Dashboard uses: 'team-1'
#    Firestore should have: collection 'teams' → doc 'team-1'

# 3. Re-run initialization script
export GOOGLE_APPLICATION_CREDENTIALS="firebase-admin-key.json"
node scripts/init-firestore-data.js
```

### Issue: Slow Data Loading

**Symptoms**: Taking >5 seconds to load tickets

**Solutions**:
```bash
# 1. Check network tab in DevTools
#    Verify Firebase requests are fast

# 2. Enable Firestore indexes (if needed)
#    Firebase will suggest indexes for complex queries

# 3. Verify database region
#    Should be close to your location

# 4. Clear React Query cache
#    Ctrl+Shift+Delete (browser cache clearing)
```

### Issue: Data Not Persisting After Page Refresh

**Symptoms**: Tickets appear then disappear

**Solutions**:
```typescript
// Check offline persistence is enabled in client.ts
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Offline persistence:', err);
});

// Verify IndexedDB in DevTools
// DevTools → Storage → IndexedDB → firebase database
```

### Issue: TypeScript Errors with Timestamp

**Symptoms**: `error TS2769: No overload matches this call`

**Solutions**:
```typescript
// Wrong:
createdAt: new Date('2024-01-15')

// Correct:
import { Timestamp } from 'firebase/firestore';
createdAt: Timestamp.fromDate(new Date('2024-01-15'))

// Or:
createdAt: Timestamp.now()
```

---

## 📊 Verify Complete Setup

Use this checklist to ensure everything is configured:

- [ ] Firebase project created
- [ ] Firestore database created
- [ ] `.env.local` file configured
- [ ] Firebase config imported in `lib/firebase/config.ts`
- [ ] Security rules updated and published
- [ ] Sample data initialized (4 tickets, 4 contacts)
- [ ] Dashboard loads without errors
- [ ] Can create new ticket
- [ ] Can update ticket status
- [ ] Can delete ticket
- [ ] Changes appear in Firestore Console
- [ ] Offline persistence working
- [ ] React Query caching working

---

## 🚀 Advanced Configuration

### Enable Real-time Listeners (Optional)

For real-time updates without manual refresh:

```typescript
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';

const q = query(
  collection(db, 'teams', teamId, 'tickets'),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const tickets = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Update state with real-time data
  setTickets(tickets);
});

// Remember to cleanup:
return unsubscribe;
```

### Setup Firestore Indexes

For complex queries, create indexes:

1. Go to **Firestore Database** → **Indexes** tab
2. Create composite index for:
   - Collection: `tickets`
   - Fields: `status` (Ascending), `createdAt` (Descending)
3. Firebase will auto-suggest indexes for slow queries

### Enable Cloud Backups

1. Go to **Firestore Database** → **Backups** tab
2. Click **Create backup**
3. Set retention period (e.g., 7 days)
4. Enable automated backups

---

## 📞 Support & Resources

### Documentation Links
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Get Data from Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/get-data)
- [Add Data to Cloud Firestore](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Delete Data](https://firebase.google.com/docs/firestore/manage-data/delete-data)
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)

### Common Commands
```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build

# Type checking
npm run type-check   # Verify TypeScript

# Linting
npm run lint         # Check code quality
```

---

## ✅ Next Steps

After completing setup:

1. **Test all CRUD operations** in dashboard
2. **Verify data in Firestore Console**
3. **Check browser console** for errors
4. **Test offline mode** (disable network, refresh)
5. **Review security rules** in production
6. **Setup monitoring** in Firebase Console

---

**Firestore Integration Setup Complete! 🎉**

Your Jiwaku CRM Ticket Management System is now fully integrated with Firebase Firestore.
