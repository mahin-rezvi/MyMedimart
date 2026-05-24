"use server";
import { query } from "./postgres";
import { User as FirebaseUser } from "firebase/auth";
import { randomUUID } from "crypto";

/**
 * Sync Firebase user to Neon PostgreSQL database
 * Creates or updates user record after Firebase authentication
 */
export async function syncFirebaseUserToNeon(firebaseUser: FirebaseUser): Promise<void> {
  try {
    if (!firebaseUser.email) {
      console.warn("Firebase user has no email, skipping sync");
      return;
    }

    // Check if user exists
    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [firebaseUser.email]
    );

    if (existing.rows.length === 0) {
      // Create new user
      const userId = firebaseUser.uid || randomUUID();
      await query(
        `INSERT INTO users (id, email, name, is_active, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [userId, firebaseUser.email, firebaseUser.displayName || "", true, "CUSTOMER"]
      );
    } else {
      // Update existing user
      await query(
        `UPDATE users 
         SET name = COALESCE($1, name), updated_at = NOW()
         WHERE email = $2`,
        [firebaseUser.displayName || "", firebaseUser.email]
      );
    }
  } catch (error) {
    console.error("Failed to sync Firebase user to Neon:", error);
    // Don't throw - allow authentication to succeed even if sync fails
  }
}

/**
 * Get user from Neon database by email (for verification after Firebase auth)
 */
export async function getNeonUserByEmail(email: string) {
  try {
    const result = await query(
      "SELECT id, email, name, role, is_active FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch user from Neon:", error);
    return null;
  }
}

/**
 * Get user from Neon database by ID
 */
export async function getNeonUserById(id: string) {
  try {
    const result = await query(
      "SELECT id, email, name, role, is_active FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch user from Neon:", error);
    return null;
  }
}
