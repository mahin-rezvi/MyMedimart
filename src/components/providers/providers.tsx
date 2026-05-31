"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
