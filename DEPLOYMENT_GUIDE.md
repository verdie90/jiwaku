# 🚀 Jiwaku CRM - Command Reference & Deployment Guide

## Quick Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Seed database (if needed)
npm run seed
```

### Verification
```bash
# Check TypeScript errors (should show nothing)
npm run type-check

# Build and check for errors
npm run build

# Run type check
tsc --noEmit
```

---

## Environment Setup

### 1. Create `.env.local` file
```bash
cp .env.example .env.local
```

### 2. Configure Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Configure Application URLs
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure Optional Services
```env
# Optional: Twilio for calls
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=...

# Optional: WhatsApp Cloud API
NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID=...

# Optional: AI Models
NEXT_PUBLIC_OPENAI_API_KEY=...

# Optional: Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## Testing Login Flow

### 1. Create Test User in Firestore
Go to Firebase Console → Firestore → Create document in `users` collection:
```json
{
  "id": "test-user-123",
  "email": "test@example.com",
  "name": "Test User",
  "role": "admin",
  "teamId": "test-team",
  "status": "online",
  "password": "[bcrypt hashed password]",
  "createdAt": "2025-10-23T00:00:00Z",
  "updatedAt": "2025-10-23T00:00:00Z"
}
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Login
- URL: `http://localhost:3000/login`
- Email: `test@example.com`
- Password: `TestPassword123` (or your test password)

### 4. Verify Dashboard
- After login, should redirect to `/dashboard`
- Check sidebar, header, and stats are loading
- Check localStorage has `authToken` and `cachedUser`

---

## Deployment Checklist

### Pre-Deployment ✅
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors in browser
- [ ] Login flow tested
- [ ] Dashboard renders correctly
- [ ] All features verified
- [ ] Environment variables configured
- [ ] Firebase Firestore database created
- [ ] Firebase security rules configured

### Staging Deployment
```bash
# 1. Build
npm run build

# 2. Deploy to staging server
# Using your hosting provider (Vercel, Firebase Hosting, etc.)
```

### Production Deployment
```bash
# 1. Final build
npm run build

# 2. Deploy to production
# Using your hosting provider

# 3. Verify
# Test login and key features in production
```

---

## Firestore Security Rules

### Basic Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Production Rules (Restricted)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Team data - based on team membership
    match /conversations/{docId} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/conversations/$(docId)).teamId)).data.members;
    }
    
    // Sessions
    match /sessions/{token} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Monitoring & Maintenance

### Daily Tasks
- [ ] Monitor Firestore quota usage
- [ ] Check error logs
- [ ] Verify backups

### Weekly Tasks
- [ ] Review security logs
- [ ] Check performance metrics
- [ ] Update dependency status

### Monthly Tasks
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization

---

## Troubleshooting

### Issue: Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Build again
npm run build
```

### Issue: TypeScript Errors
```bash
# Type check to see all errors
npm run type-check

# Fix errors based on output
# Common issues: missing imports, type mismatches
```

### Issue: Login Not Working
1. Check Firebase credentials in `.env.local`
2. Verify Firestore database is created
3. Check user exists in `users` collection
4. Check password hash matches (use bcryptjs)
5. Check browser console for errors

### Issue: Dashboard Won't Load
1. Check authentication token in localStorage
2. Verify useAuth hook is properly initialized
3. Check Firestore queries in browser DevTools
4. Check route protection in layout.client.tsx

---

## Performance Tips

### Optimize Build
```bash
# Analyze bundle size
npm run build -- --analyze
```

### Enable Caching
```bash
# Configure Next.js caching in next.config.ts
```

### Database Optimization
- Add Firestore indexes for frequently queried fields
- Use collection groups for cross-team queries
- Implement pagination for large datasets

### Frontend Optimization
- Use React Query cache invalidation strategically
- Implement image optimization
- Use code splitting for large components
- Enable compression on static assets

---

## Database Schema

### Collections
- **users** - User accounts
- **teams** - Team information
- **sessions** - Active sessions
- **conversations** - Message threads
- **messages** - Individual messages
- **contacts** - Customer contacts
- **tickets** - Support tickets
- **automation** - Automation rules
- **webhooks** - Webhook configurations
- **templates** - Message/ticket templates
- **analytics** - Performance data

### Indexes
The application automatically uses Firestore's single-field indexes.
For complex queries, create composite indexes as suggested by Firestore.

---

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh session

### Data Routes
- `GET /api/conversations` - Get conversations
- `GET /api/tickets` - Get tickets
- `GET /api/contacts` - Get contacts
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket

---

## Useful Links

- **Firebase Console:** https://console.firebase.google.com
- **Next.js Docs:** https://nextjs.org/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Firestore:** https://firebase.google.com/docs/firestore

---

## Support

For issues or questions:
1. Check `APPLICATION_INSPECTION_REPORT.md` for detailed info
2. Check `FIXES_QUICK_SUMMARY.md` for recent fixes
3. Review auth documentation in docs/
4. Check Firebase Console for errors
5. Review browser console for client-side errors

---

**Last Updated:** October 23, 2025  
**Status:** Production Ready ✅  
**Version:** 1.0.0
