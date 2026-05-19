"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "@/lib/firebase-auth";

interface AuthUser extends User {
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!auth ? false : true);

  useEffect(() => {
    if (!auth) {
      console.warn("[AuthProvider] Firebase Auth not initialized. Auth features disabled. Check environment variables.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        document.cookie = `__session=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax`;

        // Fetch role from Firestore if configured; otherwise default to CUSTOMER
        try {
          if (FIREBASE_CONFIGURED && db) {
            const snap = await getDoc(doc(db, "users", firebaseUser.uid));
            const role = snap.exists() ? snap.data().role : "CUSTOMER";
            setUser({ ...firebaseUser, role });
          } else {
            setUser({ ...firebaseUser, role: "CUSTOMER" });
          }
        } catch (err) {
          // If Firestore fails, don't block auth — fallback to CUSTOMER
          console.warn("[auth-provider] Failed to read user role:", err);
          setUser({ ...firebaseUser, role: "CUSTOMER" });
        }
      } else {
        document.cookie = "__session=; Path=/; Max-Age=0; SameSite=Lax";
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
