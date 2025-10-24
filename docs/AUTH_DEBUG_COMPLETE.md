# 🔍 Auth Flow Debugging & Fixing Guide

## Complete Auth Flow: Login → Dashboard

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER VISITS /login                                        │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. LOGIN PAGE LOADS                                          │
│    - useAuth() hook initializes                              │
│    - Checks localStorage for authToken                       │
│    - If found + user logged in → redirect to /dashboard      │
│    - If not found → show login form                          │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USER ENTERS CREDENTIALS & CLICKS LOGIN                    │
│    - Form validates email & password                         │
│    - Calls useAuth().login(email, password)                  │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LOGIN REQUEST TO FIRESTORE                                │
│    Services/auth.service.ts: login()                         │
│    - Query users collection by email                         │
│    - Verify password matches hashed password                 │
│    - Generate session token (SHA256)                         │
│    - Create session document in Firestore                    │
│    - Return { user, token }                                  │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. STORE IN LOCALSTORAGE (hooks/useAuth.ts)                  │
│    localStorage['authToken'] = token                         │
│    localStorage['cachedUser'] = JSON.stringify(user)         │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. REDIRECT TO DASHBOARD                                     │
│    app/login/page.tsx:                                       │
│    - useEffect notices user state changed                    │
│    - Calls router.push('/dashboard')                         │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. MIDDLEWARE RUNS (middleware.ts)                           │
│    - Lets all requests pass (no auth checks)                 │
│    - Returns NextResponse.next()                             │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. DASHBOARD PAGE LOADS                                      │
│    - Page component mounts                                   │
│    - Wraps with DashboardLayout                              │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. DASHBOARDLAYOUT CHECKS AUTH                               │
│    - useAuth() reads localStorage                            │
│    - isMounted check passes                                  │
│    - Finds authToken + cachedUser                            │
│    - Sets user state                                         │
│    - isLoading = false                                       │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. LAYOUT RENDERS                                           │
│    if (isLoading) return <Spinner />  ← NOT THIS             │
│    if (!user) return null             ← NOT THIS             │
│    return <Dashboard />               ← YES THIS ✅           │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### ✅ Test 1: Fresh Login
```
BEFORE:
- Clear all localStorage
- Close browser
- Open fresh browser window

STEPS:
1. Go to http://localhost:3000/login
2. Enter test credentials (email/password)
3. Click "Sign In"

EXPECTED:
✅ Form shows "Loading..." button
✅ No console errors
✅ Redirects to /dashboard
✅ Dashboard loads with user info
✅ localStorage has 'authToken' and 'cachedUser'

IF FAILS:
❌ Check browser console for errors
❌ Check Network tab for failed requests
❌ Check Firestore: users collection has your user?
❌ Check Firestore: session document created?
```

### ✅ Test 2: localStorage Content
```
AFTER successful login, check:

console.log(localStorage.getItem('authToken'));
// Should output: a1b2c3d4e5f6... (64 char SHA256)

console.log(JSON.parse(localStorage.getItem('cachedUser')));
// Should output: { id: '...', email: '...', name: '...', ... }
```

### ✅ Test 3: Page Refresh While On Dashboard
```
STEPS:
1. Login successfully (you're on /dashboard)
2. Press F5 or Ctrl+R
3. Wait for page to reload

EXPECTED:
✅ Page reloads
✅ No redirect to /login
✅ Dashboard loads instantly (from cache)
✅ No loading spinner (unless data fetching)

IF FAILS:
❌ Check if localStorage still has both keys
❌ Check if isMounted check working
```

### ✅ Test 4: Invalid Token
```
STEPS:
1. Login successfully
2. DevTools → Application → LocalStorage
3. Edit 'authToken' to random garbage
4. Refresh page

EXPECTED:
✅ Uses cachedUser as fallback
✅ Dashboard still loads
✅ Console shows "Session verification failed"
✅ Should try to refetch when user available

IF FAILS:
❌ Fallback logic not working
❌ Check catch block in useAuth.ts
```

### ✅ Test 5: Missing Cached User
```
STEPS:
1. Login successfully
2. DevTools → Application → LocalStorage
3. Delete 'cachedUser' (keep 'authToken')
4. Refresh page

EXPECTED:
✅ Token verification from Firestore works
✅ User restores from Firestore
✅ If Firestore fails, user = null, redirect to login

IF FAILS:
❌ Firestore queries not working
❌ Check Firestore security rules
```

---

## Common Issues & Fixes

### Issue: "Login button stuck on loading"
**Root Cause:** authService.login() hanging

**Debug:**
```
1. Check console for errors
2. Check Network tab → XHR/Fetch
3. Verify Firestore connectivity
4. Check if users collection exists
```

**Fix:**
```typescript
// Add console logs to auth service:
console.log("Starting login for:", email);
const user = await this.getUserByEmail(email);
console.log("Found user:", user);
const passwordMatch = await this.comparePasswords(password, userData.password);
console.log("Password match:", passwordMatch);
```

### Issue: "Redirect to /login after login"
**Root Cause:** useAuth() not updating user state

**Debug:**
```
1. Add console log to login callback
2. Check if setUser(user) is being called
3. Check if localStorage.setItem working
```

**Fix:**
```typescript
// In hooks/useAuth.ts login function:
const { user, token } = await authService.login(email, password);
console.log("Login response - user:", user, "token:", token);

setUser(user);
console.log("User state set to:", user);

localStorage.setItem('authToken', token);
localStorage.setItem('cachedUser', JSON.stringify(user));
console.log("localStorage updated");
```

### Issue: "Dashboard layout shows loading spinner forever"
**Root Cause:** isLoading never becomes false

**Debug:**
```
1. Check isMounted state
2. Check useEffect dependencies
3. Verify localStorage access working
```

**Fix:**
```typescript
// In useAuth.ts, add logs:
useEffect(() => {
  console.log("useAuth effect started, isMounted:", isMounted);
  if (!isMounted) {
    console.log("Not mounted yet, skipping");
    return;
  }

  const initializeAuth = async () => {
    console.log("Initializing auth...");
    try {
      const token = localStorage.getItem('authToken');
      const cachedUserStr = localStorage.getItem('cachedUser');
      console.log("Found token:", !!token, "Found cachedUser:", !!cachedUserStr);
      // ... rest of logic
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  initializeAuth();
}, [isMounted]);
```

### Issue: "Session not created in Firestore"
**Root Cause:** Sessions collection doesn't exist or write fails

**Debug:**
```
1. Check Firestore → sessions collection
2. Check security rules allow writes
3. Check Network tab for Firestore errors
```

**Fix:**
```typescript
// In auth.service.ts, wrap session creation:
try {
  await setDoc(doc(this.db, 'sessions', token), {
    userId: user.id,
    email: user.email,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: true,
  });
  console.log("Session created in Firestore");
} catch (err) {
  console.error("Failed to create session:", err);
  // Still return token - will use fallback in useAuth
}
```

---

## Browser DevTools Debugging

### Console Checks

```javascript
// Check if components mounted
localStorage.getItem('authToken') // Should exist after login

// Check localStorage structure
Object.keys(localStorage)
// Should include: authToken, cachedUser

// Parse cached user
JSON.parse(localStorage.getItem('cachedUser'))
// Should show: { id, email, name, role, teamId, ... }
```

### Network Tab Checks

```
After clicking "Sign In", should see:

1. Request: POST to Firestore (or similar auth endpoint)
   Status: 200 OK
   Response: { user, token }

2. Request: GET /dashboard
   Status: 307 (redirect) or 200
   
3. NO infinite redirect chain
```

### Application Tab Checks

```
LocalStorage after login:
- authToken: "a1b2c3...64 chars total"
- cachedUser: '{"id":"...","email":"...","name":"...","role":"...","teamId":"..."}'

Cookies:
- Should be empty (we use localStorage, not cookies)
```

---

## Firestore Collections Check

### Users Collection
```
Path: /users/{userId}
Document fields:
- email: string
- name: string
- password: string (hashed)
- role: string ("agent", "admin", etc)
- teamId: string
- status: string ("online", "offline", etc)
- createdAt: Timestamp
- lastLogin: Timestamp
```

### Sessions Collection
```
Path: /sessions/{token}
Document fields:
- userId: string
- email: string
- createdAt: Timestamp
- expiresAt: Timestamp
- isActive: boolean
- logoutAt: Timestamp (optional)
```

### Check if data exists:
```
Firebase Console → Firestore Database

1. Check /users collection
   - Should have test user with matching email
   - password field should be hashed (long string)

2. Check /sessions collection
   - After login, should see new document
   - Token matches localStorage['authToken']?
```

---

## Step-by-Step Debug Process

### If login fails to redirect to dashboard:

**Step 1: Check Login Response**
```typescript
// In app/login/page.tsx, modify handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("1. Calling login with:", formData.email);
    const result = await login(formData.email, formData.password);
    console.log("2. Login result:", result);
    console.log("3. Router is:", router);
    console.log("4. About to redirect to /dashboard");
    router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
  }
};
```

**Step 2: Check useAuth login hook**
```typescript
// In hooks/useAuth.ts, add logs to login function:
try {
  console.log("[useAuth] Starting login...");
  const { user, token } = await authService.login(email, password);
  console.log("[useAuth] Got response - user:", user, "token:", token);
  
  setUser(user);
  console.log("[useAuth] User state updated to:", user);
  
  localStorage.setItem('authToken', token);
  localStorage.setItem('cachedUser', JSON.stringify(user));
  console.log("[useAuth] localStorage updated");
  
  return user;
} catch (err) {
  console.error("[useAuth] Login failed:", err);
  throw err;
}
```

**Step 3: Check auth service**
```typescript
// In services/auth.service.ts:
async login(email: string, password: string) {
  console.log("[AuthService] Login attempt for:", email);
  
  const user = await this.getUserByEmail(email);
  console.log("[AuthService] User found:", user);
  
  const passwordMatch = await this.comparePasswords(password, userData.password);
  console.log("[AuthService] Password match:", passwordMatch);
  
  const token = this.generateSessionToken(user.id);
  console.log("[AuthService] Token generated:", token);
  
  await setDoc(doc(this.db, 'sessions', token), {...});
  console.log("[AuthService] Session saved to Firestore");
  
  return { user, token };
}
```

**Step 4: Check dashboard layout**
```typescript
// In app/dashboard/layout.client.tsx:
export function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();
  console.log("[DashboardLayout] user:", user, "isLoading:", isLoading);
  
  useEffect(() => {
    console.log("[DashboardLayout] useEffect - user:", user, "isLoading:", isLoading);
    if (!isLoading && !user && !hasRedirected) {
      console.log("[DashboardLayout] Redirecting to login");
      setHasRedirected(true);
      router.push("/login");
    }
  }, [user, isLoading, router, hasRedirected]);
  
  // ... rest
}
```

---

## Quick Fix Checklist

- [ ] Firestore users collection has test user
- [ ] Firestore users collection has password field (hashed)
- [ ] Firestore sessions collection exists (or will be auto-created)
- [ ] Firestore security rules allow reads/writes
- [ ] authService.login() can query users
- [ ] Password hashing/comparison working
- [ ] Session token generation working
- [ ] useAuth() storing token + user in localStorage
- [ ] Dashboard layout reading from localStorage
- [ ] No console errors
- [ ] Network tab shows clean flow (no failed requests)

---

## Success Indicators

After fixes, you should see:

**Console:**
```
✅ [useAuth] Starting login...
✅ [useAuth] Got response - user: {...}
✅ [useAuth] User state updated
✅ [useAuth] localStorage updated
✅ [DashboardLayout] user: {...}, isLoading: false
```

**localStorage:**
```
✅ authToken: "a1b2c3d4e5..." (64 chars)
✅ cachedUser: {...user object...}
```

**Network Tab:**
```
✅ POST /firestore (or auth endpoint) → 200 OK
✅ GET /dashboard → 307 redirect to /dashboard
✅ GET /dashboard → 200 OK
✅ NO infinite redirect chain
```

**Behavior:**
```
✅ Click login → show loading
✅ After login → redirect to /dashboard
✅ Dashboard loads with user info
✅ Refresh dashboard → stays on dashboard (no redirect)
✅ Logout → redirect to home
```

---

**Status:** Ready to debug & fix ✅
**Last Updated:** Oct 23, 2025
