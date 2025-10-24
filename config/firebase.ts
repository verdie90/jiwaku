import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvgeZeOdkfETaq49f9xn-TW-IaYA2QMIY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jiwara-1f8e8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jiwara-1f8e8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jiwara-1f8e8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1009946387193",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1009946387193:web:e62fea56745496e991b828",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-38B43K3ZJX",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Firebase Collection Names
export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  TEAMS: "teams",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  CONTACTS: "contacts",
  TICKETS: "tickets",
  AGENTS: "agents",
  TEMPLATES: "templates",
  CALL_RECORDS: "call_records",
  CHAT_SESSIONS: "chat_sessions",
  WEBHOOKS: "webhooks",
  INTEGRATIONS: "integrations",
  KNOWLEDGE_BASE: "knowledge_base",
  ANALYTICS: "analytics",
} as const;

// Firebase Storage Paths
export const STORAGE_PATHS = {
  CALL_RECORDINGS: "recordings/calls",
  VOICE_MAILS: "recordings/voicemails",
  DOCUMENTS: "documents",
  ATTACHMENTS: "messages/attachments",
  PROFILE_PICTURES: "profiles/pictures",
  TEAM_LOGOS: "teams/logos",
} as const;
