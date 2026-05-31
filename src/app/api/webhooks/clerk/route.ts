import { Webhook } from "svix";
import { headers } from "next/headers";
import { queryOne, query as dbQuery } from "@/lib/db/postgres";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

interface ClerkWebhookEmail {
  email_address?: string;
  primary?: boolean;
}

interface ClerkWebhookUser {
  id: string;
  email_addresses?: ClerkWebhookEmail[];
  first_name?: string | null;
  last_name?: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkWebhookUser;
}

function getPrimaryEmail(emailAddresses: ClerkWebhookEmail[] = []) {
  return (
    emailAddresses.find((email) => email.primary)?.email_address ||
    emailAddresses[0]?.email_address ||
    ""
  );
}

export async function POST(req: Request) {
  try {
    // Get the Svix headers
    const headersList = await headers();
    const svixId = headersList.get("svix-id") || "";
    const svixTimestamp = headersList.get("svix-timestamp") || "";
    const svixSignature = headersList.get("svix-signature") || "";

    // Get the body
    const body = await req.text();

    // Create a new Webhook instance with your secret
    const wh = new Webhook(webhookSecret);

    let msg: ClerkWebhookEvent;
    try {
      msg = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventType = msg.type;

    // Handle user.created event
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = msg.data;
      const primaryEmail = getPrimaryEmail(email_addresses);

      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";

      try {
        // Check if user already exists
        const existingUser = await queryOne(
          "SELECT id FROM users WHERE id = $1",
          [id]
        );

        if (!existingUser) {
          // Insert new user with CUSTOMER role
          await dbQuery(
            `INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               email = EXCLUDED.email,
               name = EXCLUDED.name,
               is_active = true,
               updated_at = NOW()`,
            [id, primaryEmail, fullName, "CUSTOMER", true]
          );

          console.log(`User created: ${id} - ${primaryEmail}`);
        }
      } catch (err) {
        console.error("Error creating user in database:", err);
        return Response.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    }

    // Handle user.updated event
    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = msg.data;
      const primaryEmail = getPrimaryEmail(email_addresses);

      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";

      try {
        // Update user in database
        await dbQuery(
          `UPDATE users 
           SET email = $1, name = $2, updated_at = NOW()
           WHERE id = $3`,
          [primaryEmail, fullName, id]
        );

        console.log(`User updated: ${id} - ${primaryEmail}`);
      } catch (err) {
        console.error("Error updating user in database:", err);
        return Response.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }
    }

    // Handle user.deleted event
    if (eventType === "user.deleted") {
      const { id } = msg.data;

      try {
        // Soft delete - set is_active to false instead of deleting
        await dbQuery(
          `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
          [id]
        );

        console.log(`User deactivated: ${id}`);
      } catch (err) {
        console.error("Error deactivating user in database:", err);
        return Response.json(
          { error: "Failed to deactivate user" },
          { status: 500 }
        );
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook failed" }, { status: 500 });
  }
}
