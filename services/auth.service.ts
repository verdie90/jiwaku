import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  Firestore,
  serverTimestamp,
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import { User, Session } from "@/types";
import { FIRESTORE_COLLECTIONS } from "@/config/firebase";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/client";

/**
 * Authentication Service
 */
export class AuthService {
  private auth: Auth;
  private db: Firestore;

  constructor(auth?: Auth, db?: Firestore) {
    this.auth = auth || getFirebaseAuth();
    this.db = db || getFirebaseFirestore();
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<User> {
    try {
      // Enable persistence
      await setPersistence(this.auth, browserLocalPersistence);

      // Create Firebase user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Hash password (for additional security, stored in Firestore)
      const hashedPassword = await this.hashPassword(password);

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email,
        name: userData.name || "",
        role: userData.role || "agent",
        teamId: userData.teamId || "",
        status: "offline" as any, // Will be properly set during first login
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData,
      };

      await setDoc(doc(this.db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        _hashedPassword: hashedPassword, // For reference only
      });

      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Enable persistence
      await setPersistence(this.auth, browserLocalPersistence);

      // Sign in with email and password
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(
        doc(this.db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid)
      );

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const user = userDoc.data() as User;
      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<Session | null> {
    const firebaseUser = this.auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    try {
      const userDoc = await getDoc(
        doc(this.db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid)
      );

      if (!userDoc.exists()) {
        return null;
      }

      const user = userDoc.data() as User;
      const idToken = await firebaseUser.getIdToken();

      return {
        user,
        token: {
          accessToken: idToken,
          expiresIn: 3600, // 1 hour
        },
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Verify email
   */
  async verifyEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("No user logged in");
    }

    // This would require additional Firebase configuration
    console.log("Email verification would be sent to:", user.email);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const { sendPasswordResetEmail: firebaseSendPasswordReset } = await import(
        "firebase/auth"
      );
      await firebaseSendPasswordReset(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare passwords
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Handle Firebase auth errors
   */
  private handleAuthError(error: any): Error {
    const errorCode = error?.code || "unknown";
    let message = "An authentication error occurred";

    switch (errorCode) {
      case "auth/user-not-found":
        message = "User not found";
        break;
      case "auth/wrong-password":
        message = "Incorrect password";
        break;
      case "auth/email-already-in-use":
        message = "Email already in use";
        break;
      case "auth/weak-password":
        message = "Password is too weak";
        break;
      case "auth/invalid-email":
        message = "Invalid email address";
        break;
      case "auth/too-many-requests":
        message = "Too many login attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection.";
        break;
      default:
        message = error?.message || message;
    }

    const authError = new Error(message);
    authError.name = errorCode;
    return authError;
  }
}

// Export singleton instance
export const authService = new AuthService();
