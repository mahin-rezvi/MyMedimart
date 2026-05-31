"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-brand-100 dark:border-brand-900">
          <Sparkles className="w-3 h-3" />
          Welcome back
        </div>
        <h1 className="font-display text-3xl font-black text-foreground leading-tight">
          Sign in to your<br />
          <span className="text-brand-600">account</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-brand-600 font-semibold hover:underline">
            Create one free →
          </Link>
        </p>
      </div>

      {/* Clerk SignIn Component */}
      <SignIn
        path="/login"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-white dark:bg-gray-900/80 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/40 p-7 backdrop-blur-sm",
            formButtonPrimary: "bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 font-semibold",
            formFieldInput: "form-input rounded-xl h-11",
            dividerLine: "bg-gray-200 dark:bg-gray-700",
            dividerText: "text-xs text-muted-foreground font-medium",
            footerActionLink: "text-brand-600 hover:underline font-semibold",
            socialButtonsBlockButton: "border border-gray-200 dark:border-gray-700 rounded-2xl h-11 font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all",
            socialButtonsBlockButtonText: "font-semibold",
          },
        }}
      />
    </div>
  );
}
