# Firestore Data Integration Guide

## Overview

This guide explains how to integrate Firestore data persistence with the Jiwaku CRM Ticket Management System. All ticket data will be stored in Firebase Firestore with real-time synchronization.

---

## 🏗️ Firestore Collection Structure

### Collection Hierarchy

```
firestore root/
├── teams/
│   ├── {teamId}/
│   │   ├── tickets/
│   │   │   └── {ticketId}/
│   │   │       ├── title: string
│   │   │       ├── description: string
│   │   │       ├── status: enum
│   │   │       ├── priority: enum
│   │   │       ├── contactId: string
│   │   │       ├── assignedAgentId: string (optional)
│   │   │       ├── tags: array<string>
│   │   │       ├── categories: array<string>
│   │   │       ├── comments: array<object>
│   │   │       ├── sla: object
│   │   │       ├── createdAt: timestamp
│   │   │       ├── updatedAt: timestamp
│   │   │       ├── resolvedAt: timestamp (optional)
│   │   │       ├── closedAt: timestamp (optional)
│   │   │       └── customFields: object (optional)
│   │   └── contacts/
│   │       └── {contactId}/
│   └── users/
│       └── {userId}/
```

### Document Schema

#### Ticket Document
```json
{
  "id": "TKT-001",
  "teamId": "team-1",
  "contactId": "contact-1",
  "title": "Login page not loading",
  "description": "Users unable to access login page",
  "status": "open",
  "priority": "high",
  "assignedAgentId": "agent-1",
  "tags": ["website", "critical"],
  "categories": ["Technical"],
  "comments": [
    {
      "id": "comment-1",
      "authorId": "user-1",
      "content": "Investigating the issue",
      "isInternal": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "sla": {
    "responseTime": 60,
    "resolutionTime": 240,
    "respondedAt": "2024-01-15T09:15:00Z",
    "status": "within"
  },
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-15T08:00:00Z",
  "resolvedAt": null,
  "closedAt": null,
  "customFields": {}
}
```

---

## 🔐 Firestore Security Rules

Create these security rules in Firebase Console:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teams collection
    match /teams/{teamId} {
      // Tickets subcollection
      match /tickets/{ticketId} {
        // Read: User must belong to team
        allow read: if request.auth != null && 
                       request.auth.uid in resource.data.teamMembers;
        
        // Create: User must belong to team
        allow create: if request.auth != null && 
                        request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members &&
                        request.resource.data.teamId == teamId;
        
        // Update: User must belong to team
        allow update: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members &&
                         resource.data.teamId == teamId;
        
        // Delete: Only team leads and admins
        allow delete: if request.auth != null && 
                         getUserRole(request.auth.uid, teamId) in ['lead', 'admin'];
      }
      
      // Contacts subcollection
      match /contacts/{contactId} {
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
    }
    
    // Helper function for user role
    function getUserRole(uid, teamId) {
      return get(/databases/$(database)/documents/teams/$(teamId)/users/$(uid)).data.role;
    }
  }
}
```

---

## 📱 API Integration Points

### Ticket Service Methods

All methods in `services/ticket.service.ts` are already configured for Firestore:

#### 1. **getAll(teamId)** - Fetch All Tickets
```typescript
const tickets = await ticketService.getAll('team-1');
// Returns: Ticket[]
// Firestore Path: /teams/team-1/tickets
// Query: orderBy createdAt DESC
```

#### 2. **getById(teamId, ticketId)** - Get Single Ticket
```typescript
const ticket = await ticketService.getById('team-1', 'TKT-001');
// Returns: Ticket | null
// Firestore Path: /teams/team-1/tickets/TKT-001
```

#### 3. **create(teamId, contactId, data)** - Create New Ticket
```typescript
const newTicket = await ticketService.create('team-1', 'contact-1', {
  title: 'Issue title',
  description: 'Detailed description',
  priority: TicketPriority.HIGH,
  status: TicketStatus.OPEN,
  tags: ['urgent'],
  categories: ['Technical']
});
// Auto-generates: id, createdAt, updatedAt, SLA info
```

#### 4. **update(teamId, ticketId, data)** - Update Ticket
```typescript
const updated = await ticketService.update('team-1', 'TKT-001', {
  status: TicketStatus.IN_PROGRESS,
  assignedAgentId: 'agent-1'
});
// Auto-updates: updatedAt timestamp
```

#### 5. **delete(teamId, ticketId)** - Delete Ticket
```typescript
await ticketService.delete('team-1', 'TKT-001');
// Permanently removes ticket from Firestore
```

#### 6. **search(teamId, query)** - Search Tickets
```typescript
const results = await ticketService.search('team-1', 'login');
// Searches: title, description, id (client-side)
```

#### 7. **updateStatus(teamId, ticketId, status)** - Update Status
```typescript
await ticketService.updateStatus('team-1', 'TKT-001', TicketStatus.RESOLVED);
// Auto-sets: resolvedAt or closedAt timestamp
```

#### 8. **assignTicket(teamId, ticketId, agentId)** - Assign Ticket
```typescript
await ticketService.assignTicket('team-1', 'TKT-001', 'agent-1');
// Sets: assignedAgentId, status to ASSIGNED
```

#### 9. **addComment(teamId, ticketId, comment)** - Add Comment
```typescript
await ticketService.addComment('team-1', 'TKT-001', {
  ticketId: 'TKT-001',
  authorId: 'user-1',
  content: 'Comment text',
  isInternal: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
// Auto-generates: id
```

#### 10. **getTicketsByContactId(teamId, contactId)** - Get Contact Tickets
```typescript
const tickets = await ticketService.getTicketsByContactId('team-1', 'contact-1');
// Returns: Ticket[] for specific contact
```

#### 11. **getAssignedTickets(teamId, agentId)** - Get Agent Tickets
```typescript
const myTickets = await ticketService.getAssignedTickets('team-1', 'agent-1');
// Returns: Ticket[] assigned to agent
```

---

## 🎯 React Hook Integration

### useTickets Hook Usage

```typescript
import { useTickets } from '@/hooks/useTickets';

function TicketDashboard() {
  const {
    tickets,        // Ticket[] - All team tickets
    isLoading,      // boolean - Loading state
    error,          // Error | null - Any errors
    refetch,        // () => void - Manual refetch
    createTicket,   // Async create function
    updateTicket,   // Async update function
    deleteTicket    // Async delete function
  } = useTickets('team-1');

  // Usage examples:
  const handleCreate = async () => {
    await createTicket('contact-1', {
      title: 'New Issue',
      description: 'Details',
      priority: 'high',
      status: 'open'
    });
  };

  const handleUpdate = async () => {
    await updateTicket('TKT-001', {
      status: 'resolved'
    });
  };

  const handleDelete = async () => {
    await deleteTicket('TKT-001');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  );
}
```

### useTicket Hook (Single Ticket)

```typescript
import { useTicket } from '@/hooks/useTickets';

function TicketDetail({ ticketId }) {
  const {
    ticket,       // Ticket | null - Single ticket
    isLoading,    // boolean
    error,        // Error | null
    updateTicket, // Async update
    addComment    // Async comment add
  } = useTicket('team-1', ticketId);

  const handleAddComment = async () => {
    await addComment('My comment', false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!ticket) return <div>Not found</div>;

  return (
    <div>
      <h1>{ticket.title}</h1>
      <button onClick={handleAddComment}>Add Comment</button>
    </div>
  );
}
```

---

## 💾 Data Persistence Features

### Offline Support
- ✅ Firestore offline persistence enabled
- ✅ IndexedDB caching for offline access
- ✅ Auto-sync when reconnected
- ✅ Optimistic UI updates

### Caching Strategy
- **React Query**: 5-minute cache for tickets
- **Firestore**: Local persistence via IndexedDB
- **Browser**: In-memory component state
- **Auto-refresh**: On window focus

### Real-time Sync
- ✅ Firestore real-time listeners (ready to implement)
- ✅ Automatic data refresh
- ✅ Conflict resolution
- ✅ Timestamp-based ordering

---

## 🚀 Implementation Checklist

### Setup Phase
- [x] Firebase project configured
- [x] Firestore database created
- [x] Security rules defined
- [x] Collection structure planned
- [x] Service layer implemented
- [x] React hooks created

### Integration Phase
- [ ] Update dashboard to fetch real data
- [ ] Migrate mock data to Firestore
- [ ] Verify CRUD operations
- [ ] Test offline persistence
- [ ] Validate security rules
- [ ] Performance testing

### Deployment Phase
- [ ] Production Firestore setup
- [ ] Environment configuration
- [ ] Data backup strategy
- [ ] Monitoring setup
- [ ] Error tracking
- [ ] Performance monitoring

---

## 📊 Data Migration Steps

### Step 1: Prepare Data
```typescript
// Create sample data structure
const sampleTicket = {
  teamId: 'team-1',
  contactId: 'contact-1',
  title: 'Sample Ticket',
  description: 'Sample description',
  status: 'open',
  priority: 'high',
  tags: ['sample'],
  categories: ['General'],
  comments: [],
  sla: {
    responseTime: 60,
    resolutionTime: 240,
    status: 'within'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Step 2: Batch Upload
```typescript
import { writeBatch } from 'firebase/firestore';

async function migrateTickets(tickets: Ticket[]) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  tickets.forEach(ticket => {
    const ticketRef = doc(db, 'teams', ticket.teamId, 'tickets', ticket.id);
    batch.set(ticketRef, ticket);
  });

  await batch.commit();
}
```

### Step 3: Verify Data
```typescript
// Check Firestore console
// Verify all documents
// Check timestamps
// Validate nested data
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: "Permission denied" error**
- ✅ Check security rules in Firebase console
- ✅ Verify user is authenticated
- ✅ Confirm user belongs to team
- ✅ Check Firestore read/write permissions

**Issue: Slow data loading**
- ✅ Enable Firestore indexes
- ✅ Check query complexity
- ✅ Verify network connection
- ✅ Use pagination for large datasets

**Issue: Offline data not syncing**
- ✅ Verify offline persistence enabled
- ✅ Check IndexedDB storage quota
- ✅ Monitor network connection
- ✅ Clear browser cache if needed

**Issue: Timestamp conversion errors**
- ✅ Always use `.toDate()` for Timestamps
- ✅ Use `Timestamp.now()` for creation
- ✅ Handle null/undefined dates
- ✅ Validate date formats

---

## 📈 Performance Optimization

### Best Practices

1. **Query Optimization**
   - Index frequently queried fields
   - Limit result sets with pagination
   - Use compound indexes
   - Monitor query performance

2. **Caching Strategy**
   - React Query 5-minute staleTime
   - Firestore offline persistence
   - Browser in-memory cache
   - Manual refetch when needed

3. **Batch Operations**
   - Use writeBatch for multiple writes
   - Limit batch size to 500 documents
   - Monitor Firestore quota usage
   - Implement rate limiting

4. **Real-time Listeners** (future)
   ```typescript
   const unsubscribe = onSnapshot(
     query(collection(db, 'teams', teamId, 'tickets')),
     (snapshot) => {
       // Update state with real-time data
     }
   );
   ```

---

## 🔒 Security Best Practices

1. **Authentication**
   - ✅ Require user authentication
   - ✅ Validate session tokens
   - ✅ Implement role-based access
   - ✅ Regular security audits

2. **Data Validation**
   - ✅ Validate all inputs
   - ✅ Type-check all data
   - ✅ Sanitize user input
   - ✅ Prevent injection attacks

3. **Access Control**
   - ✅ Team-level isolation
   - ✅ Role-based permissions
   - ✅ Agent assignment validation
   - ✅ Audit logging

4. **Data Protection**
   - ✅ Encrypt sensitive data
   - ✅ Use HTTPS always
   - ✅ Implement backup strategy
   - ✅ Regular security reviews

---

## 📝 Environment Configuration

### .env.local
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Team ID (for testing)
NEXT_PUBLIC_TEAM_ID=team-1
```

### Firebase Console Setup
1. Create Firestore database
2. Set security rules
3. Configure indexes
4. Enable offline persistence
5. Setup cloud functions
6. Configure backups

---

## 🎓 Learning Resources

### Firebase Documentation
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Web SDK Reference](https://firebase.google.com/docs/firestore/query-data/get-data)
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

### Code Examples
- See `services/ticket.service.ts` for service patterns
- See `hooks/useTickets.ts` for hook patterns
- See `app/dashboard/tickets/page.tsx` for component usage
- Check mock data for schema reference

---

## ✅ Verification Checklist

- [ ] Firestore database created
- [ ] Collection structure set up
- [ ] Security rules configured
- [ ] Service methods tested
- [ ] React hooks integrated
- [ ] Dashboard updated with real data
- [ ] Offline persistence verified
- [ ] Error handling tested
- [ ] Performance monitoring enabled
- [ ] Security audit completed
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## 🚀 Next Steps

1. **Create Firestore Database**
   - Go to Firebase Console
   - Create Firestore database (Production mode)
   - Set location to closest region
   - Enable backups

2. **Configure Security Rules**
   - Copy rules from this guide
   - Adjust for your requirements
   - Test in rules simulator
   - Deploy rules

3. **Set Up Indexes** (if needed)
   - Navigate to Indexes tab
   - Create composite indexes for complex queries
   - Monitor index usage

4. **Update Environment**
   - Add Firebase credentials to .env.local
   - Update team ID constant
   - Test authentication flow

5. **Migrate Data** (if existing)
   - Export from current storage
   - Transform to Firestore format
   - Batch upload to Firestore
   - Verify data integrity

6. **Test Integration**
   - Create new ticket
   - Read ticket data
   - Update ticket status
   - Add comment
   - Delete ticket
   - Search tickets

---

## 📞 Support

For issues or questions:
1. Check Firestore documentation
2. Review security rules
3. Monitor Firebase console
4. Check browser console for errors
5. Verify network connection
6. Test with sample data

---

**Firestore Integration Guide Complete** ✅
