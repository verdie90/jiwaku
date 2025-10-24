'use client';

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Firestore,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { User } from '@/types';
import { FIRESTORE_COLLECTIONS } from '@/config/firebase';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import crypto from 'crypto';

/**
 * Complete Firebase Firestore Authentication Service
 * Pure Firestore implementation with bcrypt password hashing
 * No Firebase Authentication - all auth via Firestore database only
 * Includes full password reset functionality
 */
export class AuthService {
  private db: Firestore;
  private readonly USERS_COLLECTION = FIRESTORE_COLLECTIONS.USERS;
  private readonly PASSWORD_RESET_COLLECTION = 'passwordResets';
  private readonly SALT_ROUNDS = 10;
  private readonly RESET_TOKEN_EXPIRY_HOURS = 24;

  constructor(db?: Firestore) {
    this.db = db || getFirebaseFirestore();
  }

  /**
   * Register new user with email and password
   * Stores user data and hashed password in Firestore
   */
  async register(
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<User> {
    try {
      this.validateEmail(email);
      this.validatePassword(password);

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email sudah terdaftar');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Generate unique ID
      const userId = this.generateUserId();

      // Create user object
      const user: User = {
        id: userId,
        email,
        name: userData.name || '',
        role: userData.role || 'agent',
        teamId: userData.teamId || '',
        status: 'offline' as any, // Will be updated by frontend when user is active
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData,
      };

      // Store in Firestore
      await setDoc(doc(this.db, this.USERS_COLLECTION, userId), {
        ...user,
        password: hashedPassword,
        emailVerified: false,
        lastLogin: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Return user without password
      return user;
    } catch (error) {
      throw this.handleError(error, 'Registrasi gagal');
    }
  }

  /**
   * Login user with email and password
   * Verifies credentials against Firestore database
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      this.validateEmail(email);
      if (!password) {
        throw new Error('Password diperlukan');
      }

      // Get user from Firestore by email
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Email atau password salah');
      }

      // Get user document to access password hash
      const usersRef = collection(this.db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Email atau password salah');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verify password
      const passwordMatch = await this.comparePasswords(
        password,
        userData.password
      );

      if (!passwordMatch) {
        throw new Error('Email atau password salah');
      }

      // Update last login
      await updateDoc(doc(this.db, this.USERS_COLLECTION, user.id), {
        lastLogin: serverTimestamp(),
      });

      // Generate session token
      const token = this.generateSessionToken(user.id);

      // Store token in Firestore
      await setDoc(doc(this.db, 'sessions', token), {
        userId: user.id,
        email: user.email,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      });

      return { user, token };
    } catch (error) {
      throw this.handleError(error, 'Login gagal');
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(token: string): Promise<void> {
    try {
      // Deactivate session
      await updateDoc(doc(this.db, 'sessions', token), {
        isActive: false,
        logoutAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error, 'Logout gagal');
    }
  }

  /**
   * Verify session token
   */
  async verifySession(token: string): Promise<User | null> {
    try {
      // Try to get session from Firestore
      try {
        const sessionDoc = await getDoc(doc(this.db, 'sessions', token));

        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();

          // Check if session is active
          if (!sessionData.isActive) {
            return null;
          }

          // Check if session has expired
          const expiresAt = sessionData.expiresAt?.toDate?.() || new Date(sessionData.expiresAt);
          if (new Date() > expiresAt) {
            return null;
          }

          // Get user
          return this.getUserById(sessionData.userId);
        }
      } catch (firestoreErr) {
        console.warn('Firestore session lookup failed, session collection may not exist:', firestoreErr);
      }
      
      // Fallback: token is valid if we can parse it and it's in expected format
      // In production, always ensure sessions collection is properly set up
      // For now, if Firestore lookup fails but token exists in localStorage,
      // we trust it (it was set during successful login)
      if (token && token.length === 64) {
        // Token looks valid (SHA256 hash is 64 chars), trust it
        // User info will be restored from localStorage in the app
        console.warn('Using token without session verification - ensure sessions collection is set up');
        return null; // Return null to force re-authentication, but allow app to render
      }

      return null;
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(this.db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      const { password: _, ...userWithoutPassword } = userData;
      return {
        ...userWithoutPassword,
        id: userDoc.id,
        createdAt: userData.createdAt?.toDate?.() || new Date(),
        updatedAt: userData.updatedAt?.toDate?.() || new Date(),
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(
        doc(this.db, this.USERS_COLLECTION, userId)
      );

      if (!userDoc.exists()) {
        return null;
      }

      const user = userDoc.data();
      const { password: _, ...userWithoutPassword } = user;

      return {
        ...userWithoutPassword,
        id: userDoc.id,
        createdAt: user.createdAt?.toDate?.() || new Date(),
        updatedAt: user.updatedAt?.toDate?.() || new Date(),
      } as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Request password reset
   * Generates reset token and stores in Firestore
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      this.validateEmail(email);

      // Check if user exists
      const user = await this.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        throw new Error('Jika email terdaftar, link reset password akan dikirim');
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(
        Date.now() + this.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
      );

      // Store reset token in Firestore
      await setDoc(
        doc(this.db, this.PASSWORD_RESET_COLLECTION, resetToken),
        {
          token: resetToken,
          email,
          userId: user.id,
          expiresAt,
          used: false,
          createdAt: serverTimestamp(),
        }
      );

      return resetToken;
    } catch (error) {
      throw this.handleError(error, 'Permintaan reset password gagal');
    }
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string): Promise<string> {
    try {
      const tokenDoc = await getDoc(
        doc(this.db, this.PASSWORD_RESET_COLLECTION, token)
      );

      if (!tokenDoc.exists()) {
        throw new Error('Token reset tidak valid atau sudah kadaluarsa');
      }

      const tokenData = tokenDoc.data();

      // Check if token is expired
      const expiresAt = new Date(tokenData.expiresAt);
      if (new Date() > expiresAt) {
        throw new Error('Token reset sudah kadaluarsa');
      }

      // Check if token was already used
      if (tokenData.used) {
        throw new Error('Token reset sudah digunakan');
      }

      return tokenData.email;
    } catch (error) {
      throw this.handleError(error, 'Token reset tidak valid');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);

      // Verify token and get email
      const email = await this.verifyResetToken(token);

      // Get user
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User tidak ditemukan');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await updateDoc(doc(this.db, this.USERS_COLLECTION, user.id), {
        password: hashedPassword,
        updatedAt: serverTimestamp(),
      });

      // Mark token as used
      await updateDoc(
        doc(this.db, this.PASSWORD_RESET_COLLECTION, token),
        {
          used: true,
          usedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      throw this.handleError(error, 'Reset password gagal');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      this.validatePassword(newPassword);

      // Get user
      const userDoc = await getDoc(
        doc(this.db, this.USERS_COLLECTION, userId)
      );

      if (!userDoc.exists()) {
        throw new Error('User tidak ditemukan');
      }

      const userData = userDoc.data();

      // Verify current password
      const passwordMatch = await this.comparePasswords(
        currentPassword,
        userData.password
      );

      if (!passwordMatch) {
        throw new Error('Password saat ini tidak sesuai');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await updateDoc(doc(this.db, this.USERS_COLLECTION, userId), {
        password: hashedPassword,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error, 'Perubahan password gagal');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const allowedFields = ['name', 'avatar', 'phoneNumber', 'department', 'status'];
      const filteredUpdates: Record<string, any> = {};

      allowedFields.forEach((field) => {
        if (field in updates) {
          filteredUpdates[field] = (updates as any)[field];
        }
      });

      filteredUpdates.updatedAt = serverTimestamp();

      await updateDoc(doc(this.db, this.USERS_COLLECTION, userId), filteredUpdates);

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User tidak ditemukan');
      }

      return updatedUser;
    } catch (error) {
      throw this.handleError(error, 'Update profil gagal');
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      // Get user
      const userDoc = await getDoc(
        doc(this.db, this.USERS_COLLECTION, userId)
      );

      if (!userDoc.exists()) {
        throw new Error('User tidak ditemukan');
      }

      const userData = userDoc.data();

      // Verify password
      const passwordMatch = await this.comparePasswords(
        password,
        userData.password
      );

      if (!passwordMatch) {
        throw new Error('Password tidak sesuai');
      }

      // Mark as deleted
      await updateDoc(doc(this.db, this.USERS_COLLECTION, userId), {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error, 'Penghapusan akun gagal');
    }
  }

  /**
   * Hash password with bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      throw new Error('Hashing password gagal');
    }
  }

  /**
   * Compare passwords
   */
  private async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error('Perbandingan password gagal');
    }
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session token
   */
  private generateSessionToken(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}${timestamp}${random}`)
      .digest('hex');
    return hash;
  }

  /**
   * Generate reset token
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email tidak valid');
    }
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password minimal 8 karakter');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error(
        'Password harus mengandung huruf besar, huruf kecil, dan angka'
      );
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any, context: string): Error {
    const message = error?.message || context;
    const authError = new Error(message);
    authError.name = 'AuthError';
    return authError;
  }
}

// Export singleton instance
export const authService = new AuthService();
