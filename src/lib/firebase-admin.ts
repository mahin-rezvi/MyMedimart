import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: Storage | null = null;

function getAdminApp(): App | null {
  if (_app) return _app;
  if (getApps().length > 0) { _app = getApps()[0]; return _app; }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey || rawKey.includes("YOUR_PRIVATE_KEY")) {
    console.warn("[firebase-admin] Missing or placeholder credentials — Admin SDK not initialized.");
    return null;
  }

  try {
    _app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return _app;
  } catch (err) {
    console.error("[firebase-admin] Initialization failed:", err);
    return null;
  }
}

function getAdminDb(): Firestore {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin SDK not configured. Add FIREBASE_ADMIN_* env vars.");
  if (!_db) _db = getFirestore(app);
  return _db;
}

function getAdminAuth(): Auth {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin SDK not configured. Add FIREBASE_ADMIN_* env vars.");
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

function getAdminStorage(): Storage {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin SDK not configured. Add FIREBASE_ADMIN_* env vars.");
  if (!_storage) _storage = getStorage(app);
  return _storage;
}

// Export getter functions — call these inside route handlers, NOT at module level
export { getAdminDb as adminDb, getAdminAuth as adminAuth, getAdminStorage as adminStorage };
