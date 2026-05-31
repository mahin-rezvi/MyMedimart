import { auth, currentUser } from "@clerk/nextjs/server";
import { usersRepo } from "./db/repositories";
import type { User } from "./db/types";

export async function getCurrentDbUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `user-${userId}@medimart.local`;
  const name =
    clerkUser?.fullName ??
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ??
    undefined;
  const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber ?? undefined;

  const existing = await usersRepo.getById(userId);
  if (existing) {
    const updates: Record<string, unknown> = {};
    let hasUpdates = false;

    // Only include fields that have actually changed
    if (name && existing.name !== name) {
      updates.name = name;
      hasUpdates = true;
    }
    if (phone && existing.phone !== phone) {
      updates.phone = phone;
      hasUpdates = true;
    }
    
    // Only try to update email if it has changed
    if (existing.email !== email) {
      updates.email = email;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      return existing;
    }

    try {
      return await usersRepo.update(userId, updates);
    } catch (error) {
      // If update fails (e.g., duplicate email), return existing user
      console.error("Failed to update user:", error);
      return existing;
    }
  }

  return usersRepo.create({
    id: userId,
    email,
    password_hash: undefined,
    name,
    phone,
    role: "CUSTOMER",
    is_active: true,
  });
}

export async function requireCurrentDbUser(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdminDbUser(): Promise<User> {
  const user = await requireCurrentDbUser();
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new Error("Admin access required");
  }
  return user;
}
