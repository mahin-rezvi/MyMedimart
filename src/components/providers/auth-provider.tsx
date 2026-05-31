"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthUser {
  uid: string;
  email?: string | null;
  name?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(
  {
    user: null,
    loading: true,
    isAdmin: false,
    signOut: async () => {},
  }
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      void Promise.resolve().then(() => {
        setRole("CUSTOMER");
        setLoading(false);
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile");
        if (response.ok) {
          const data = await response.json();
          setRole(data.role || "CUSTOMER");
        } else {
          setRole("CUSTOMER");
        }
      } catch (err) {
        console.warn("[AuthProvider] Failed to load profile:", err);
        setRole("CUSTOMER");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn, clerkUser]);

  const authUser = useMemo(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress
      ?? clerkUser.emailAddresses?.[0]?.emailAddress
      ?? null;
    const displayName = clerkUser.fullName
      ?? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
      ?? null;
    const photoURL = clerkUser.imageUrl ?? null;

    const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null;

    return {
      uid: clerkUser.id,
      email,
      name: displayName,
      displayName,
      phoneNumber,
      photoURL,
      role,
    };
  }, [isLoaded, isSignedIn, clerkUser, role]);

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        loading: !isLoaded || loading,
        isAdmin: authUser?.role === "ADMIN" || authUser?.role === "SUPER_ADMIN",
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
