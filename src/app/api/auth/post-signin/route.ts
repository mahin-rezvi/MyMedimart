import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * This route handles post-sign-in redirect
 * Can be customized to fetch additional data from Neon
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    // Redirect to home or dashboard
    redirect("/");
  } catch (error) {
    console.error("Post-signin error:", error);
    redirect("/");
  }
}
