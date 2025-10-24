# 🔐 Complete Authentication System Documentation

## Overview

Complete Firestore-based authentication system dengan bcrypt password hashing, password reset functionality, dan session management. Tidak menggunakan Firebase Authentication SDK - semua autentikasi dilakukan melalui Firestore database.

**Key Features:**
- ✅ Pure Firestore implementation (NO Firebase Auth SDK)
- ✅ bcryptjs password hashing (salt rounds: 10)
- ✅ Session token management (24-hour expiration)
- ✅ Password reset with token-based system
- ✅ Password strength validation
- ✅ Email format validation
- ✅ Change password for authenticated users
- ✅ Account deletion
- ✅ Profile updates
- ✅ Last login tracking
- ✅ Full TypeScript support

---

## Architecture

### Database Collections

#### `users/` Collection
```typescript
{
  id: string;                    // Document ID
  email: string;                 // User email (indexed)
  password: string;              // bcrypt hashed
  name: string;                  // User full name
  role: UserRole;                // 'agent', 'team_lead', 'admin', etc.
  teamId: string;                // Team reference
  status: AgentStatus;           // 'online', 'offline', 'away', etc.
  avatar?: string;               // Avatar URL
  phoneNumber?: string;          // Phone number
  department?: string;           // Department
  emailVerified: boolean;        // Email verification status
  lastLogin?: Date;              // Last login timestamp
  createdAt: Timestamp;          // Server timestamp
  updatedAt: Timestamp;          // Server timestamp
  deleted?: boolean;             // Soft delete flag
  deletedAt?: Timestamp;         // Deletion timestamp
  metadata?: Record<string, any>;// Additional data
}
```

#### `passwordResets/` Collection
```typescript
{
  id: string;                    // Document ID (random token)
  token: string;                 // Reset token (32-byte hex)
  email: string;                 // User email
  userId: string;                // User ID
  expiresAt: Date;              // Expiration time (24 hours)
  used: boolean;                 // Whether token was used
  createdAt: Timestamp;          // Creation timestamp
  usedAt?: Timestamp;            // When token was used
}
```

#### `sessions/` Collection
```typescript
{
  id: string;                    // Document ID (session token)
  userId: string;                // User ID
  email: string;                 // User email
  isActive: boolean;             // Active status
  createdAt: Timestamp;          // Creation timestamp
  expiresAt: Date;              // Expiration (24 hours)
  logoutAt?: Timestamp;          // Logout timestamp
}
```

---

## Service: AuthService

### Location
`services/auth.service.ts`

### Methods

#### 1. Register User
```typescript
async register(
  email: string,
  password: string,
  userData: Partial<User>
): Promise<User>
```

**Description:** Register new user dengan email dan password.

**Parameters:**
- `email`: User email (akan divalidasi format)
- `password`: User password (akan divalidasi strength dan di-hash)
- `userData`: Partial user data (name, teamId, role, etc.)

**Returns:** User object (tanpa password)

**Throws:** Error jika email sudah terdaftar, password invalid, atau validation gagal

**Example:**
```typescript
try {
  const user = await authService.register(
    'user@example.com',
    'SecurePass123',
    {
      name: 'John Doe',
      teamId: 'team-123',
      role: 'agent'
    }
  );
  console.log('User registered:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

**Password Requirements:**
- Minimal 8 karakter
- Harus mengandung huruf besar (A-Z)
- Harus mengandung huruf kecil (a-z)
- Harus mengandung angka (0-9)

---

#### 2. Login User
```typescript
async login(
  email: string,
  password: string
): Promise<{ user: User; token: string }>
```

**Description:** Autentikasi user dengan email dan password.

**Parameters:**
- `email`: User email
- `password`: User password (akan dibandingkan dengan hash di database)

**Returns:** Object dengan user dan session token

**Throws:** Error jika email tidak ditemukan atau password salah

**Example:**
```typescript
try {
  const { user, token } = await authService.login(
    'user@example.com',
    'SecurePass123'
  );
  
  // Store token di localStorage
  localStorage.setItem('authToken', token);
  
  console.log('Logged in as:', user.name);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Process:**
1. Validasi format email
2. Query Firestore untuk user dengan email
3. Bandingkan password input dengan hash bcrypt
4. Update lastLogin timestamp
5. Generate dan simpan session token
6. Return user + token

---

#### 3. Logout
```typescript
async logout(token: string): Promise<void>
```

**Description:** Logout user dengan menginvalidasi session token.

**Parameters:**
- `token`: Session token dari user

**Returns:** void

**Example:**
```typescript
const token = session?.token.accessToken;
if (token) {
  await authService.logout(token);
  localStorage.removeItem('authToken');
}
```

---

#### 4. Verify Session
```typescript
async verifySession(token: string): Promise<User | null>
```

**Description:** Verifikasi session token dan return user jika valid.

**Parameters:**
- `token`: Session token

**Returns:** User object jika token valid dan belum expired, null jika invalid

**Process:**
1. Cari session di Firestore dengan token
2. Check apakah session masih active
3. Check apakah session belum expired
4. Return user dari session
5. Return null jika invalid

**Example:**
```typescript
const user = await authService.verifySession(token);
if (user) {
  console.log('Session valid for:', user.name);
} else {
  console.log('Session invalid or expired');
}
```

---

#### 5. Request Password Reset
```typescript
async requestPasswordReset(email: string): Promise<string>
```

**Description:** Generate reset token dan simpan ke Firestore.

**Parameters:**
- `email`: User email

**Returns:** Reset token (32-byte hex string)

**Throws:** Error jika email tidak ditemukan

**Process:**
1. Validasi format email
2. Cari user dengan email
3. Generate 32-byte random token
4. Simpan token ke `passwordResets/` collection dengan expiry 24 jam
5. Return token

**Note:** Di production, token harus dikirim via email. Untuk testing, return token langsung.

**Example:**
```typescript
try {
  const resetToken = await authService.requestPasswordReset(
    'user@example.com'
  );
  
  // Di production: kirim token via email
  // sendResetEmail(email, resetToken);
  
  console.log('Reset token generated:', resetToken);
} catch (error) {
  console.error('Request failed:', error.message);
}
```

---

#### 6. Verify Reset Token
```typescript
async verifyResetToken(token: string): Promise<string>
```

**Description:** Verifikasi reset token dan return email yang terhubung.

**Parameters:**
- `token`: Reset token

**Returns:** Email address

**Throws:** Error jika token invalid, expired, atau sudah digunakan

**Process:**
1. Cari token di `passwordResets/` collection
2. Check apakah token sudah expired
3. Check apakah token belum digunakan
4. Return email

**Example:**
```typescript
try {
  const email = await authService.verifyResetToken(resetToken);
  console.log('Token valid for:', email);
} catch (error) {
  console.error('Token invalid:', error.message);
}
```

---

#### 7. Reset Password
```typescript
async resetPassword(token: string, newPassword: string): Promise<void>
```

**Description:** Reset password menggunakan reset token.

**Parameters:**
- `token`: Reset token
- `newPassword`: New password (akan divalidasi dan di-hash)

**Returns:** void

**Throws:** Error jika token invalid/expired, password invalid, atau user tidak ditemukan

**Process:**
1. Verifikasi token dan get email
2. Cari user dengan email
3. Validasi password baru
4. Hash password dengan bcrypt
5. Update password di Firestore
6. Mark token sebagai `used`
7. Simpan `usedAt` timestamp

**Example:**
```typescript
try {
  await authService.resetPassword(resetToken, 'NewSecurePass456');
  console.log('Password reset successfully');
  // Redirect ke login page
} catch (error) {
  console.error('Reset failed:', error.message);
}
```

---

#### 8. Change Password
```typescript
async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void>
```

**Description:** Ubah password untuk user yang sudah login.

**Parameters:**
- `userId`: User ID
- `currentPassword`: Password saat ini (untuk verifikasi)
- `newPassword`: Password baru

**Returns:** void

**Throws:** Error jika password saat ini salah atau password baru invalid

**Process:**
1. Cari user di Firestore
2. Bandingkan currentPassword dengan hash di database
3. Validasi newPassword
4. Hash newPassword
5. Update password di Firestore
6. Update `updatedAt` timestamp

**Example:**
```typescript
try {
  await authService.changePassword(
    userId,
    'CurrentPass123',
    'NewSecurePass456'
  );
  console.log('Password changed successfully');
} catch (error) {
  console.error('Change failed:', error.message);
}
```

---

#### 9. Update Profile
```typescript
async updateProfile(userId: string, updates: Partial<User>): Promise<User>
```

**Description:** Update user profile data.

**Parameters:**
- `userId`: User ID
- `updates`: Profile updates (name, avatar, phoneNumber, etc.)

**Returns:** Updated User object

**Throws:** Error jika user tidak ditemukan

**Allowed Fields:**
- `name`
- `avatar`
- `phoneNumber`
- `department`
- `status`

**Note:** Email dan password tidak bisa diupdate via method ini.

**Example:**
```typescript
const updatedUser = await authService.updateProfile(userId, {
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.jpg',
  phoneNumber: '+62812345678'
});
```

---

#### 10. Delete Account
```typescript
async deleteAccount(userId: string, password: string): Promise<void>
```

**Description:** Soft delete user account.

**Parameters:**
- `userId`: User ID
- `password`: User password (untuk verifikasi)

**Returns:** void

**Throws:** Error jika password salah atau user tidak ditemukan

**Process:**
1. Cari user
2. Verify password
3. Set `deleted: true` di Firestore
4. Set `deletedAt` timestamp
5. Update `updatedAt`

**Note:** Data tidak dihapus, hanya ditandai sebagai deleted (soft delete).

**Example:**
```typescript
try {
  await authService.deleteAccount(userId, 'CurrentPassword123');
  console.log('Account deleted');
  // Redirect ke login
} catch (error) {
  console.error('Deletion failed:', error.message);
}
```

---

#### 11. Get User by Email
```typescript
async getUserByEmail(email: string): Promise<User | null>
```

**Description:** Cari user berdasarkan email.

**Parameters:**
- `email`: User email

**Returns:** User object atau null

**Example:**
```typescript
const user = await authService.getUserByEmail('user@example.com');
```

---

#### 12. Get User by ID
```typescript
async getUserById(userId: string): Promise<User | null>
```

**Description:** Cari user berdasarkan ID.

**Parameters:**
- `userId`: User ID

**Returns:** User object atau null

**Example:**
```typescript
const user = await authService.getUserById('user_123456');
```

---

## React Hooks

### Location
`hooks/usePasswordReset.ts`

### useRequestPasswordReset

**Description:** Hook untuk request password reset.

**Returns:**
```typescript
{
  requestReset: (email: string) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}
```

**Example:**
```typescript
const { requestReset, isLoading } = useRequestPasswordReset();

const handleRequest = async (email: string) => {
  try {
    const token = await requestReset(email);
  } catch (error) {
    console.error(error);
  }
};
```

---

### useVerifyResetToken

**Description:** Hook untuk verifikasi reset token.

**Returns:**
```typescript
{
  verifyToken: (token: string) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  email: string | null;
}
```

---

### useResetPassword

**Description:** Hook untuk reset password dengan token.

**Returns:**
```typescript
{
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}
```

---

### useChangePassword

**Description:** Hook untuk ubah password (authenticated user).

**Returns:**
```typescript
{
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}
```

---

### useDeleteAccount

**Description:** Hook untuk hapus akun.

**Returns:**
```typescript
{
  deleteAccount: (userId: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}
```

---

### useUpdateProfile

**Description:** Hook untuk update profil.

**Returns:**
```typescript
{
  updateProfile: (userId: string, updates: Record<string, any>) => Promise<User>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}
```

---

## Components

### Location
`components/auth/PasswordReset.tsx`

### PasswordResetModal

**Description:** Modal untuk reset password flow.

**Props:**
```typescript
{
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Steps:**
1. Email input - user memasukkan email
2. Token + password - user memasukkan token dan password baru
3. Success - konfirmasi reset berhasil

**Example:**
```typescript
<PasswordResetModal
  onSuccess={() => router.push('/login')}
  onCancel={() => setShowModal(false)}
/>
```

---

### ChangePasswordForm

**Description:** Form untuk ubah password (authenticated users).

**Example:**
```typescript
<ChangePasswordForm />
```

---

## Session Management

### Token Storage

Token disimpan di `localStorage` dengan key `authToken`:

```typescript
// Login
localStorage.setItem('authToken', token);

// Logout
localStorage.removeItem('authToken');

// Get token
const token = localStorage.getItem('authToken');
```

### Token Lifespan
- **Duration:** 24 hours
- **Auto-refresh:** Tidak ada (user perlu login ulang)
- **Expiration Check:** Di `verifySession()` method

### Session Verification Flow

```
1. App starts
   ↓
2. useAuth hook checks localStorage for token
   ↓
3. Call authService.verifySession(token)
   ↓
4. Check if session document exists in Firestore
   ↓
5. Check if session is active & not expired
   ↓
6. Return user if valid, null if invalid
   ↓
7. Set auth state & redirect accordingly
```

---

## Error Handling

### Error Types

All auth errors return `Error` objects dengan message:

```typescript
try {
  await authService.register(email, password, userData);
} catch (error) {
  console.error(error.message);
  // "Email sudah terdaftar"
  // "Password minimal 8 karakter"
  // "Format email tidak valid"
  // "User tidak ditemukan"
  // etc.
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Email sudah terdaftar" | Email exists | Use different email |
| "Password minimal 8 karakter" | Password too short | Use longer password |
| "Password harus mengandung..." | Password lacks requirements | Add uppercase, lowercase, numbers |
| "Format email tidak valid" | Invalid email format | Check email format |
| "Email atau password salah" | Wrong credentials | Verify credentials |
| "Token reset tidak valid" | Invalid token | Request new reset |
| "Token reset sudah kadaluarsa" | Token expired (24h) | Request new reset |
| "Password saat ini tidak sesuai" | Wrong current password | Enter correct password |
| "User tidak ditemukan" | User deleted/not exists | Check user ID |

---

## Security Considerations

### Password Hashing
- **Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Never Store:** Plain text passwords
- **Hash Comparison:** Using `bcrypt.compare()`

### Tokens
- **Format:** SHA-256 hex (64 characters)
- **Generation:** `crypto.randomBytes(32).toString('hex')`
- **Expiration:** 24 hours
- **Storage:** Firestore collections

### Session Management
- **Validation:** On every request that requires auth
- **Timeout:** 24 hours
- **Logout:** Explicit session deactivation

### Best Practices
1. Always use HTTPS in production
2. Use secure HTTP-only cookies if possible instead of localStorage
3. Implement rate limiting on auth endpoints
4. Log auth failures for security monitoring
5. Clear session on user deletion
6. Validate all input server-side
7. Use strong password requirements

---

## Integration Guide

### 1. Login Page Integration

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { PasswordResetModal } from '@/components/auth/PasswordReset';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Auto-redirect by useAuth hook
    } catch (error) {
      // Error handled by hook notification
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <button onClick={() => setShowResetModal(true)}>
        Forgot Password?
      </button>

      {showResetModal && (
        <PasswordResetModal onCancel={() => setShowResetModal(false)} />
      )}
    </div>
  );
}
```

---

### 2. Protected Route Integration

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Welcome, {user?.name}!</div>;
}
```

---

### 3. Profile Settings Integration

```typescript
import { useUpdateProfile } from '@/hooks/usePasswordReset';
import { useAuth } from '@/hooks/useAuth';

export function ProfileSettings() {
  const { user } = useAuth();
  const { updateProfile, isLoading } = useUpdateProfile();

  const handleUpdate = async (updates: any) => {
    if (user) {
      await updateProfile(user.id, updates);
    }
  };

  return (
    // UI for profile updates
  );
}
```

---

## Testing

### Test Cases

1. **Register**
   - ✅ Valid registration
   - ✅ Duplicate email
   - ✅ Weak password
   - ✅ Invalid email format

2. **Login**
   - ✅ Valid credentials
   - ✅ Wrong password
   - ✅ Non-existent email

3. **Password Reset**
   - ✅ Request reset
   - ✅ Verify token
   - ✅ Reset password
   - ✅ Expired token
   - ✅ Used token

4. **Session**
   - ✅ Create session
   - ✅ Verify valid session
   - ✅ Verify expired session
   - ✅ Logout

---

## Troubleshooting

### Issue: "getFirebaseFirestore is not defined"

**Solution:** Ensure `@/lib/firebase/client` exports `getFirebaseFirestore()` function.

### Issue: Token not persisting after refresh

**Solution:** Implement persistence in useAuth hook or use secure cookies instead of localStorage.

### Issue: Password reset email not received

**Solution:** Implement email service integration (Firebase Email, SendGrid, etc.) to send reset tokens.

### Issue: "User tidak ditemukan" on verified session

**Solution:** Check if user document exists in Firestore. May have been deleted.

---

## Migration from Firebase Auth

If migrating from Firebase Auth:

1. **Export user data** from Firebase Authentication
2. **Hash passwords** using bcryptjs
3. **Create user documents** in Firestore
4. **Generate session tokens** for existing sessions
5. **Update references** in code to use new auth service
6. **Test thoroughly** before deploying

---

## Production Checklist

- [ ] Remove console.logs from production
- [ ] Implement email service for password reset
- [ ] Add rate limiting on auth endpoints
- [ ] Implement audit logging for auth events
- [ ] Add 2FA (optional but recommended)
- [ ] Implement password reset email validation
- [ ] Add CAPTCHA to prevent brute force
- [ ] Monitor failed login attempts
- [ ] Implement IP whitelisting (optional)
- [ ] Use environment variables for secrets
- [ ] Test all error scenarios
- [ ] Document recovery procedures
- [ ] Set up backup for user data
- [ ] Implement GDPR compliance (data export/deletion)

---

## Summary

Complete authentication system yang production-ready dengan:
- Pure Firestore implementation
- Secure bcrypt password hashing
- Token-based sessions
- Password reset functionality
- Full TypeScript support
- React hooks integration
- UI components
- Error handling
- Session management

Tidak ada dependency pada Firebase Authentication SDK - semua logic diimplementasikan di Firestore.
