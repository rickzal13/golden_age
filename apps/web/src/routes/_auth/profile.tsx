import { useEffect, useState } from "react";
import { changePasswordApi, updateProfileApi } from "../../features/auth/api";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAuthStore } from "../../features/auth/store";
import { getChildrenApi } from "../../features/children/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const { setAuth, accessToken } = useAuthStore();

  // Profile overview
  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Summary
  const [childrenCount, setChildrenCount] = useState<number | null>(null);
  const [totalGrowthRecords, setTotalGrowthRecords] = useState<number | null>(null);

  useEffect(() => {
    getChildrenApi()
      .then((res) => setChildrenCount(res.data.length))
      .catch(() => {});
    // Growth summary will be fetched when API supports batch summary
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await updateProfileApi({ fullName });
      if (accessToken) setAuth(res.data, accessToken);
      setEditingName(false);
      setMessage("Profile updated");
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordError("");
    setPasswordMessage("");
    setChangingPassword(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      setPasswordMessage("Password changed");
    } catch {
      setPasswordError("Failed to change password. Check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      {(message || passwordMessage) && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message || passwordMessage}
        </div>
      )}
      {(error || passwordError) && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || passwordError}
        </div>
      )}

      {/* Profile Overview */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xl font-semibold text-teal-700">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-0.5 text-xs text-gray-400 capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        {memberSince && <p className="mt-4 text-xs text-gray-400">Member since {memberSince}</p>}
      </div>

      {/* Account Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Account Summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Children</p>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{childrenCount ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Growth Records</p>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">
              {totalGrowthRecords ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Last Login</p>
            <p className="mt-0.5 text-xs font-medium text-gray-600">Today</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Account Information</h2>
          {!editingName && (
            <button
              type="button"
              onClick={() => {
                setEditingName(true);
                setFullName(user.fullName);
              }}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Edit
            </button>
          )}
        </div>

        {editingName ? (
          <form onSubmit={handleUpdateProfile} className="mt-4 space-y-3">
            <div>
              <label htmlFor="pf-name" className="block text-xs font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="pf-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || fullName === user.fullName}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Full Name</span>
              <span className="font-medium text-gray-700">{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-gray-700">{user.email}</span>
            </div>
            {user.phone ? (
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium text-gray-700">{user.phone}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-gray-400">Country</span>
              <span className="font-medium text-gray-700">{user.countryCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Language</span>
              <span className="font-medium text-gray-700">
                {user.languagePreference === "en" ? "English" : "Bahasa Indonesia"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Security</h2>
          {!showPasswordSection && (
            <button
              type="button"
              onClick={() => setShowPasswordSection(true)}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <div className="relative">
              <label htmlFor="pf-current" className="block text-xs font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="pf-current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2 top-7 text-xs text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="pf-new" className="block text-xs font-medium text-gray-700">
                New Password
              </label>
              <input
                id="pf-new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2 top-7 text-xs text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="pf-confirm" className="block text-xs font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="pf-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-7 text-xs text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {changingPassword ? "Changing..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
        <div className="mt-3 space-y-3">
          {[
            { label: "Email Notifications", desc: "Receive email reminders and updates" },
            { label: "Growth Reminders", desc: "Reminders to log your child's growth" },
            { label: "Vaccination Reminders", desc: "Upcoming vaccine notifications" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-xs text-gray-300">{item.desc}</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-gray-100" />
            </div>
          ))}
          <p className="text-xs text-gray-300 italic">Notification preferences coming soon</p>
        </div>
      </div>

      {/* Support */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Support</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            { label: "Help Center", href: "#" },
            { label: "Contact Support", href: "#" },
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg border border-gray-100 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => useAuthStore.getState().clearAuth()}
          className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
