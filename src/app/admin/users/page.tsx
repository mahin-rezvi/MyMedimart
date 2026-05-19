"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { Search, UserX, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface UserDoc {
  id: string; email: string; displayName: string; phone: string;
  role: string; isActive: boolean; createdAt?: { seconds: number };
  photoURL?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  CUSTOMER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    if (!FIREBASE_CONFIGURED || !db) { setLoading(false); return; }
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserDoc)));
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (user: UserDoc) => {
    try {
      if (!FIREBASE_CONFIGURED || !db) { toast.error("Firestore not configured"); return; }
      await updateDoc(doc(db, "users", user.id), { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? "banned" : "unbanned"}`);
    } catch { toast.error("Update failed"); }
  };

  const toggleRole = async (user: UserDoc) => {
    const newRole = user.role === "CUSTOMER" ? "ADMIN" : "CUSTOMER";
    try {
      if (!FIREBASE_CONFIGURED || !db) { toast.error("Firestore not configured"); return; }
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error("Update failed"); }
  };

  const filtered = users.filter((u) =>
    !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="btn-ghost p-2 rounded-lg" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-blue-600" },
          { label: "Active Users", value: users.filter((u) => u.isActive).length, color: "text-green-600" },
          { label: "Admins", value: users.filter((u) => u.role !== "CUSTOMER").length, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{loading ? "…" : s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="form-input pl-9 h-9 text-sm w-full" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><p className="text-muted-foreground">No users found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Phone</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Joined</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 font-bold text-sm">
                            {(user.displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.displayName || "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.phone || "—"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {user.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-BD") : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleRole(user)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors" title={user.role === "CUSTOMER" ? "Make Admin" : "Make Customer"}>
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleStatus(user)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" title={user.isActive ? "Ban" : "Unban"}>
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
