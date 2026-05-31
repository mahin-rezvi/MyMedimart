"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export default function AdminEmailControlPage() {
  const { userId } = useAuth();
  const [step, setStep] = useState<"password" | "update">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Fetch current admin email
  useEffect(() => {
    const fetchEmail = async () => {
      if (!userId) return;
      try {
        const res = await fetch("/api/admin/email");
        if (res.ok) {
          const data = await res.json();
          setCurrentEmail(data.email);
          setNewEmail(data.email);
        }
      } catch (error) {
        console.error("Failed to fetch email:", error);
        toast.error("Failed to load current email");
      }
    };

    fetchEmail();
  }, [userId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter the admin password");
      return;
    }

    setVerifying(true);
    try {
      // Test the password by attempting to update with current email
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, newEmail: currentEmail }),
      });

      if (res.status === 403) {
        toast.error("Invalid password");
      } else if (res.ok) {
        toast.success("Password verified");
        setPassword("");
        setStep("update");
      } else {
        const error = await res.json();
        toast.error(error.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("Failed to verify password");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter a new email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, newEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Admin email updated successfully");
        setCurrentEmail(newEmail);
        setStep("password");
        setPassword("");
        setNewEmail("");
      } else {
        toast.error(data.error || "Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("password");
    setPassword("");
    setNewEmail(currentEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Admin Email Control
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-8">
            {step === "password"
              ? "Enter the admin password to proceed"
              : "Update the admin email address"}
          </p>

          {step === "password" ? (
            // Password Verification Form
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    disabled={verifying}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    disabled={verifying}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || !password.trim()}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Verify Password
                  </>
                )}
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 This page allows only authorized users with the admin password to change the system's admin email address.
                </p>
              </div>
            </form>
          ) : (
            // Email Update Form
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Admin Email
                </label>
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                  {currentEmail}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Admin Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new admin email"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newEmail.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Update Email
                    </>
                  )}
                </button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ The admin email is used for important system notifications and communications. Update it carefully.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        {step === "password" && (
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Only users with the admin password can access this page
          </p>
        )}
      </div>
    </div>
  );
}
