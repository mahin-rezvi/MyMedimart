"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// Prefer the device/browser language for Firebase UI flows when available.
try {
  if (auth && typeof auth.useDeviceLanguage === "function") auth.useDeviceLanguage();
} catch (e: unknown) {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.warn("[firebase-auth] Failed to set device language:", errorMessage);
}

// ─── Configuration Check ──────────────────────────────────────────────────────
function checkFirebaseConfig(): void {
  if (!auth) {
    throw new Error(
      "Firebase Authentication is not initialized.\n\n" +
      "Missing configuration:\n" +
      "1. NEXT_PUBLIC_FIREBASE_API_KEY\n" +
      "2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\n" +
      "3. NEXT_PUBLIC_FIREBASE_PROJECT_ID\n\n" +
      "Update the single project .env file with Firebase Web App credentials."
    );
  }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────
function getAuthInstance() {
  if (!auth) {
    throw new Error(
      "Firebase Auth is not initialized. Make sure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in .env"
    );
  }
  return auth;
}

export async function signInWithGoogle(): Promise<User> {
  checkFirebaseConfig();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(getAuthInstance(), provider);
    await ensureUserDoc(result.user);
    return result.user;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    if (message.includes("CONFIGURATION_NOT_FOUND")) {
      throw new Error("Google OAuth not configured. Check Firebase Authentication settings.");
    }
    throw err;
  }
}

// ─── Email / Password ─────────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string): Promise<User> {
  checkFirebaseConfig();
  const result = await signInWithEmailAndPassword(getAuthInstance(), email, password);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  checkFirebaseConfig();
  const result = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserDoc(result.user, displayName);
  return result.user;
}

// ─── Phone / OTP ──────────────────────────────────────────────────────────────
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  checkFirebaseConfig();
  return new RecaptchaVerifier(getAuthInstance(), containerId, {
    size: "invisible",
    callback: () => {},
  });
}

export async function sendOtp(
  phone: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  checkFirebaseConfig();
  return signInWithPhoneNumber(getAuthInstance(), phone, recaptchaVerifier);
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<User> {
  const result = await confirmationResult.confirm(otp);
  await ensureUserDoc(result.user);
  return result.user;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  checkFirebaseConfig();
  await firebaseSignOut(getAuthInstance());
}

// ─── Auth State ───────────────────────────────────────────────────────────────
export { onAuthStateChanged };

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function ensureUserDoc(user: User, displayName?: string): Promise<void> {
  if (!db) {
    console.warn("[firebase-auth] Firestore is not available. Skipping user profile creation.");
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? "",
        displayName: displayName ?? user.displayName ?? "",
        phone: user.phoneNumber ?? "",
        photoURL: user.photoURL ?? "",
        role: "CUSTOMER",
        isActive: true,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn("[firebase-auth] Failed to ensure user doc in Firestore:", err);
  }
}

// ─── Get user role from Firestore ─────────────────────────────────────────────
export async function getUserRole(uid: string): Promise<string> {
  if (!db) {
    console.warn("[firebase-auth] Firestore is not available. Returning fallback role.");
    return "CUSTOMER";
  }

  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data().role as string) : "CUSTOMER";
  } catch (err) {
    console.warn("[firebase-auth] Failed to get user role:", err);
    return "CUSTOMER";
  }
}
