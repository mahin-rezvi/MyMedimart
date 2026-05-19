import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ─── Configuration Validation ─────────────────────────────────────────────────
function validateFirebaseConfig() {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("YOUR_")) {
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes("YOUR_")) {
    missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes("YOUR_")) {
    missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID.includes("YOUR_")) {
    missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  }

  return missing;
}

const missingVars = validateFirebaseConfig();
if (missingVars.length > 0) {
  console.error(
    "❌ Firebase Web App configuration incomplete!\n" +
    "Missing or placeholder environment variables:\n" +
    missingVars.map(v => `  - ${v}`).join("\n") +
    "\n\nUpdate the single project .env file with Firebase Web App credentials.\n" +
    "Get your config from: Firebase Console → Project Settings → Your apps → Web App"
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Prevent duplicate initialization in Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let _auth = null;
let _db = null;
let _storage = null;

try {
  // Only initialize services if required config exists — Firestore needs projectId
  if (firebaseConfig.apiKey) _auth = getAuth(app);
  if (firebaseConfig.projectId) _db = getFirestore(app);
  if (firebaseConfig.storageBucket) _storage = getStorage(app);

  if (_auth) {
    _auth.useDeviceLanguage();
  }
} catch (err) {
  // Avoid throwing low-level firebase errors that crash the app at runtime.
  // Provide a clear console warning for developers.
  console.warn("Firebase initialization failed:", err);
}

export const FIREBASE_AUTH_CONFIGURED = Boolean(_auth);
export const FIREBASE_DB_CONFIGURED = Boolean(_db);
export const FIREBASE_STORAGE_CONFIGURED = Boolean(_storage);
export const FIREBASE_CONFIGURED = Boolean(_auth || _db || _storage);
export const auth = _auth as ReturnType<typeof getAuth> | null;
export const db = _db as ReturnType<typeof getFirestore> | null;
export const storage = _storage as ReturnType<typeof getStorage> | null;
export default app;
