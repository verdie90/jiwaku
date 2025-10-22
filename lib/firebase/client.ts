import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import {
  getAuth,
  Auth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from "firebase/storage";
import {
  getDatabase,
  Database,
  connectDatabaseEmulator,
} from "firebase/database";
import {
  getMessaging,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { firebaseConfig } from "@/config/firebase";

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let database: Database;
let messaging: Messaging | null = null;
let storageEmulatorConnected = false;

/**
 * Initialize Firebase App
 */
export function initializeFirebase(): FirebaseApp {
  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Get Firestore instance
 */
export function getFirebaseFirestore(): Firestore {
  if (!app) {
    initializeFirebase();
  }

  if (!db) {
    db = getFirestore(app);

    // Enable offline persistence
    if (typeof window !== "undefined") {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code === "unimplemented") {
          console.warn("The current browser does not support offline persistence.");
        }
      });
    }
  }

  return db;
}

/**
 * Get Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!app) {
    initializeFirebase();
  }

  if (!auth) {
    auth = getAuth(app);

    // Connect to emulator in development
    if (process.env.NODE_ENV === "development" && !auth.emulatorConfig) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", {
          disableWarnings: true,
        });
      } catch (error) {
        console.log("Auth emulator already connected or unavailable");
      }
    }
  }

  return auth;
}

/**
 * Get Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!app) {
    initializeFirebase();
  }

  if (!storage) {
    storage = getStorage(app);
    // Connect to emulator in development
    if (process.env.NODE_ENV === "development" && !storageEmulatorConnected) {
      try {
        connectStorageEmulator(storage, "localhost", 9199);
        storageEmulatorConnected = true;
      } catch (error) {
        console.log("Storage emulator already connected or unavailable");
      }
    }
  }

  return storage;
}

/**
 * Get Realtime Database instance
 */
export function getFirebaseDatabase(): Database {
  if (!app) {
    initializeFirebase();
  }

  if (!database) {
    database = getDatabase(app);

    // Connect to emulator in development
    if (process.env.NODE_ENV === "development") {
      try {
        connectDatabaseEmulator(database, "localhost", 9000);
      } catch (error) {
        console.log("Database emulator already connected or unavailable");
      }
    }
  }

  return database;
}

/**
 * Get Cloud Messaging instance
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!app) {
    initializeFirebase();
  }

  if (!messaging && "serviceWorker" in navigator) {
    try {
      messaging = getMessaging(app);
      setupMessagingListeners();
    } catch (error) {
      console.log("Cloud Messaging not available:", error);
    }
  }

  return messaging || null;
}

/**
 * Setup messaging listeners
 */
function setupMessagingListeners() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);

    const notificationTitle = payload.notification?.title || "New Message";
    const notificationOptions = {
      body: payload.notification?.body || "",
      icon: payload.notification?.icon || "/images/logo.png",
      badge: "/images/badge.png",
      tag: "jiwaku-notification",
      requireInteraction: false,
    };

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  });
}

/**
 * Get all Firebase services
 */
export function getFirebaseServices() {
  return {
    app: initializeFirebase(),
    db: getFirebaseFirestore(),
    auth: getFirebaseAuth(),
    storage: getFirebaseStorage(),
    database: getFirebaseDatabase(),
    messaging: getFirebaseMessaging(),
  };
}
