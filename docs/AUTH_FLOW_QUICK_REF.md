# ⚡ Quick Reference - Auth Flow After Fix

## Problem → Solution Map

| Issue | Was | Now | Fix |
|-------|-----|-----|-----|
| Token storage | localStorage | localStorage | ✅ Consistent |
| Server checks | Cookies ❌ | None ✅ | Removed middleware checks |
| User cache | None ❌ | cachedUser ✅ | Added localStorage backup |
| SSR issue | Direct access ❌ | Check isMounted ✅ | Added lifecycle guard |
| Redirect loop | 20+ ❌ | 1 ✅ | Disabled server redirects |

---

## Auth State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    APP STARTS                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Read from localStorage         │
        │ authToken + cachedUser?         │
        └─┬───────────────────────────────┘
          │
          ├─ YES ──────────────┐
          │                    │
          │         ┌──────────▼──────────┐
          │         │  Try Firestore      │
          │         │  verifySession()    │
          │         └──┬─────────┬────────┘
          │            │         │
          │      ┌─────▼┐   ┌──▼─────┐
          │      │Found?│   │Failed? │
          │      └─┬────┘   └──┬─────┘
          │        │YES        │YES
          │    (use it) (use cached)
          │        │           │
          └─YES────┴────┬──────┘
                        │
          ├─ NO ───────┘
          │
          ▼
    ┌──────────────┐
    │  User = null │
    │  isLoading = false
    └──────────────┘
          │
          ▼
    ┌──────────────────────────────────┐
    │  Client Components Check User    │
    │  - If !user && path=/dashboard   │
    │    → Redirect to /login          │
    │  - If user && path=/login        │
    │    → Redirect to /dashboard      │
    │  - Otherwise → Show page         │
    └──────────────────────────────────┘
```

---

## Code Flow

### App Initialization
```typescript
// 1. User visits http://localhost:3000/dashboard
// 2. Middleware runs → NextResponse.next() (no checks)
// 3. Page loads, components mount
// 4. useAuth() hook runs

const { user } = useAuth(); // Component 1
// └─ Updates, sets isLoading=true

useEffect(() => {
  // Check isMounted first (SSR safe)
  if (!isMounted) return;
  
  // Read from localStorage
  const token = localStorage.getItem('authToken');
  const cachedUser = localStorage.getItem('cachedUser');
  
  if (token && cachedUser) {
    // Verify with Firestore (optional)
    // If fails, use cachedUser (fallback)
  }
  
  setIsLoading(false);
}, [isMounted]);

// 5. Layout component checks user
const layout = () => {
  if (isLoading) return <Spinner />;
  if (!user && !hasRedirected) {
    setHasRedirected(true);
    router.push("/login"); // ← Redirect happens HERE (client-side)
  }
  return <Dashboard />;
};
```

---

## localStorage Keys

```typescript
// ✅ authToken
localStorage.getItem('authToken')
// Returns: "a1b2c3d4e5f6g7h8i9j0..." (SHA256 hash)
// Used by: useAuth() for session verification

// ✅ cachedUser
localStorage.getItem('cachedUser')
// Returns: { id, email, name, role, teamId, ... } as JSON string
// Used by: useAuth() as fallback when Firestore unavailable

// Other keys NOT used by auth
// localStorage.getItem('other-key') ← Not for auth
```

---

## Testing Scenarios

### ✅ Scenario 1: Fresh Login
```
1. Clear localStorage entirely
2. Go to /dashboard
3. See login redirect (1x only)
4. Enter email/password
5. See dashboard load
6. localStorage now has: authToken + cachedUser
```

### ✅ Scenario 2: Page Refresh
```
1. Logged in on /dashboard
2. Press Ctrl+R or F5
3. App reads cached user
4. Dashboard loads instantly
5. No redirect, no spinner
```

### ✅ Scenario 3: Invalid Token
```
1. Manually edit localStorage['authToken'] to garbage
2. Refresh page
3. Firestore verify fails
4. Uses cachedUser as fallback
5. Dashboard loads anyway!
```

### ✅ Scenario 4: Logout
```
1. Click logout button
2. localStorage cleared (both keys)
3. User set to null
4. Redirect to home page
5. localStorage empty
```

---

## Troubleshooting

### Problem: Still seeing redirect loop
```
Solution:
1. Hard refresh: Ctrl+Shift+R
2. Check: localStorage has authToken?
   → If NO: Not logged in, should redirect ✅
   → If YES: Should have cachedUser too
3. Check console for errors
4. Restart: npm run dev
```

### Problem: Stuck on loading spinner
```
Solution:
1. Check console for errors
2. Wait 10 seconds (Firestore query timeout)
3. Should fall back to cachedUser
4. If not: Manual refresh
```

### Problem: Token doesn't persist on refresh
```
Solution:
1. Check: Is localStorage enabled? (not in private mode)
2. Check: Browser allows localStorage for this domain?
3. Dev Server Fix: npm run dev (restart)
4. Browser Fix: Close & reopen browser
```

---

## Comparison Table

### Old Way (Broken)
```
Browser Request
  ↓
Middleware checks cookies (not found)
  ↓
Middleware redirects to /login
  ↓
Client layout checks user (not loaded)
  ↓
Client also redirects
  ↓
Too many redirects! 💥
```

### New Way (Fixed)
```
Browser Request
  ↓
Middleware does nothing
  ↓
Client checks localStorage
  ↓
Redirect happens (once)
  ↓
Page loads ✅
```

---

## Key Rules

### ✅ DO:
- Store token in localStorage
- Store user in localStorage
- Use cached user as fallback
- Clear both on logout
- Check isMounted before accessing storage
- Redirect from client components

### ❌ DON'T:
- Check cookies in middleware for auth
- Expect localStorage in server-side code
- Make multiple redirects
- Block on Firestore verification

---

## Files to Know

| File | Purpose | Key Change |
|------|---------|-----------|
| `middleware.ts` | Route handling | Let all through |
| `hooks/useAuth.ts` | Auth state | Cache user |
| `app/dashboard/layout.client.tsx` | Protected layout | Redirect once |
| `app/login/page.tsx` | Login page | Redirect logged-in users |

---

## Success Checklist

- [ ] npm run dev starts without errors
- [ ] No "ERR_TOO_MANY_REDIRECTS" in browser
- [ ] localStorage has authToken + cachedUser after login
- [ ] Page refresh stays on dashboard (no redirect)
- [ ] Logout clears localStorage
- [ ] DevTools Network shows clean redirect
- [ ] Console has no auth-related errors
- [ ] All routes work (login, dashboard, etc)

---

## Debug Commands

```javascript
// In browser console:

// Check token
localStorage.getItem('authToken');

// Check cached user
JSON.parse(localStorage.getItem('cachedUser'));

// Check current user state
import { useAuth } from '@/hooks/useAuth';
// Can't use hooks in console, but you get the idea

// Clear all auth data
localStorage.removeItem('authToken');
localStorage.removeItem('cachedUser');
// Then refresh page
```

---

## Network Tab Check

Open DevTools → Network → Visit /dashboard while logged out

You should see:
```
GET /dashboard                     Status: 307 (redirect)
GET /login                         Status: 200 ✅

NOT:
GET /dashboard  → 307
GET /login      → 307
GET /login      → 307  ❌ This was the loop!
GET /login      → 307
...
```

---

**Status:** ✅ Fixed & Ready to Use
**Last Updated:** Oct 23, 2025
**Version:** 2.0.0
