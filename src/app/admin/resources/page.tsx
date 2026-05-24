"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserRole } from "@/lib/firebase-auth";
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import { toast } from "sonner";
import { Plus, Trash2, Edit, RefreshCw, Shield, AlertTriangle } from "lucide-react";

type ResourceType = "products" | "categories" | "orders" | "users" | "banners" | "coupons";

interface Resource {
  id: string;
  name?: string;
  title?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface FormState {
  open: boolean;
  mode: "create" | "edit";
  currentResource?: Resource;
  resourceType: ResourceType;
}

export default function AdminResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedType, setSelectedType] = useState<ResourceType>("products");
  const [formState, setFormState] = useState<FormState>({
    open: false,
    mode: "create",
    resourceType: "products",
  });
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string; name?: string }>({
    open: false,
  });
  const [fetchLoading, setFetchLoading] = useState(false);

  // ─── Authorization Check ─────────────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const role = await getUserRole(user.uid);
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
          toast.error("Access Denied: Admin privileges required");
          router.push("/");
          return;
        }
        setAuthorized(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        toast.error("Authorization failed");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [user, router]);

  // ─── Fetch Resources ─────────────────────────────────────────────────────
  const fetchResources = async (type: ResourceType) => {
    if (!FIREBASE_CONFIGURED || !db) {
      toast.error("Firestore not configured");
      return;
    }

    setFetchLoading(true);
    try {
      const q = query(collection(db, type), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Resource[];
      setResources(data);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      toast.error(`Failed to load ${type}`);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (authorized && FIREBASE_CONFIGURED && db) {
      fetchResources(selectedType);
    }
  }, [selectedType, authorized]);

  // ─── Handle Create/Edit ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      if (!db || !FIREBASE_CONFIGURED) {
        toast.error("Firestore not available");
        return;
      }

      // Validate required fields based on type
      if (selectedType === "products" && !formData.name) {
        toast.error("Product name is required");
        return;
      }
      if (selectedType === "categories" && !formData.name) {
        toast.error("Category name is required");
        return;
      }
      if (selectedType === "banners" && !formData.title) {
        toast.error("Banner title is required");
        return;
      }
      if (selectedType === "coupons" && !formData.code) {
        toast.error("Coupon code is required");
        return;
      }

      if (formState.mode === "create") {
        await addDoc(collection(db, selectedType), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success(`${selectedType} created successfully`);
      } else if (formState.currentResource) {
        const docRef = doc(db, selectedType, formState.currentResource.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast.success(`${selectedType} updated successfully`);
      }

      setFormState({ open: false, mode: "create", resourceType: selectedType });
      setFormData({});
      await fetchResources(selectedType);
    } catch (err) {
      console.error("Save error:", err);
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    }
  };

  // ─── Handle Delete ──────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      if (!db || !FIREBASE_CONFIGURED) {
        toast.error("Firestore not available");
        return;
      }

      const docRef = doc(db, selectedType, id);
      await deleteDoc(docRef);
      toast.success(`${selectedType} deleted successfully`);
      setConfirmDelete({ open: false });
      await fetchResources(selectedType);
    } catch (err) {
      console.error("Delete error:", err);
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  // ─── Handle Edit ────────────────────────────────────────────────────────
  const handleEdit = (resource: Resource) => {
    setFormState({
      open: true,
      mode: "edit",
      currentResource: resource,
      resourceType: selectedType,
    });
    setFormData(resource);
  };

  // ─── Handle Create ──────────────────────────────────────────────────────
  const handleCreate = () => {
    setFormState({
      open: true,
      mode: "create",
      resourceType: selectedType,
    });
    setFormData({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  const RESOURCE_TYPES: ResourceType[] = ["products", "categories", "orders", "users", "banners", "coupons"];
  const FIELD_CONFIGS: Record<ResourceType, string[]> = {
    products: ["name", "price", "category", "description", "sku", "isActive", "isFeatured", "isFlashSale"],
    categories: ["name", "icon", "isActive"],
    orders: ["orderNumber", "userId", "status", "total", "paymentMethod"],
    users: ["email", "displayName", "role", "isActive", "phone"],
    banners: ["title", "description", "imageUrl", "link", "isActive", "order"],
    coupons: ["code", "discount", "discountType", "maxUses", "expiryDate", "isActive"],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Admin-only CRUD operations with comprehensive access controls
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Authorized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Resource Type Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedType === type
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-600"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {selectedType} ({resources.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => fetchResources(selectedType)}
              disabled={fetchLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New {selectedType}
            </button>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          {resources.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No {selectedType} found. Create one to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name/Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {resource.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {resource.name || resource.email || resource.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {resource.role && <span className="badge">{resource.role}</span>}
                      {resource.price && <span className="text-brand-600 font-semibold">৳ {resource.price}</span>}
                      {resource.status && <span className="badge badge-{resource.status}">{resource.status}</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            open: true,
                            id: resource.id,
                            name: resource.name || resource.email || resource.title,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {formState.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {formState.mode === "create" ? "Create" : "Edit"} {selectedType}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {FIELD_CONFIGS[selectedType].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field.includes("Type") || field === "role" ? (
                    <select
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select {field}</option>
                      {field === "role" && (
                        <>
                          <option value="ADMIN">Admin</option>
                          <option value="CUSTOMER">Customer</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </>
                      )}
                      {field === "discountType" && (
                        <>
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED">Fixed Amount</option>
                        </>
                      )}
                    </select>
                  ) : field === "isActive" || field === "isFeatured" || field === "isFlashSale" ? (
                    <input
                      type="checkbox"
                      checked={formData[field] || false}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  ) : field.includes("price") || field.includes("discount") ? (
                    <input
                      type="number"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : field.includes("Date") ? (
                    <input
                      type="date"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={field}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setFormState({ open: false, mode: "create", resourceType: selectedType });
                  setFormData({});
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete {selectedType}?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold">{confirmDelete.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete({ open: false })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
