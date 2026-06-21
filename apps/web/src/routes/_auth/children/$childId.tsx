import type { Child } from "@golden-age/shared";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StatusDot } from "../../../components/ui/StatusDot";
import {
  archiveChildApi,
  getChildApi,
  updateChildApi,
  uploadPhotoApi,
} from "../../../features/children/api";
import { useGrowthSummary } from "../../../features/growth/hooks/useGrowthSummary";

export default function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { summary: growthSnapshot } = useGrowthSummary(childId);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [birthWeightG, setBirthWeightG] = useState("");
  const [birthLengthCm, setBirthLengthCm] = useState("");
  const [birthBloodType, setBirthBloodType] = useState("");
  const [birthNotes, setBirthNotes] = useState("");

  useEffect(() => {
    if (!childId) return;
    getChildApi(childId)
      .then((res) => {
        const c = res.data;
        setChild(c);
        setName(c.name);
        setGender(c.gender);
        const dob = c.dateOfBirth || "";
        setDateOfBirth(dob.split("T")[0] ?? "");
        setBirthWeightG(c.birthWeightG?.toString() || "");
        setBirthLengthCm(c.birthLengthCm?.toString() || "");
        setBirthBloodType(c.birthBloodType || "");
        setBirthNotes(c.birthNotes || "");
      })
      .catch(() => setError("Failed to load child"))
      .finally(() => setLoading(false));
  }, [childId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !childId || !child) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5 MB");
      return;
    }
    setError("");
    try {
      const { url } = await uploadPhotoApi(file);
      const res = await updateChildApi(childId, { photoUrl: url });
      setChild(res.data);
      setMessage("Photo updated");
    } catch {
      setError("Failed to upload photo");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await updateChildApi(childId, {
        name,
        dateOfBirth,
        gender,
        birthWeightG: birthWeightG ? Number(birthWeightG) : null,
        birthLengthCm: birthLengthCm ? Number(birthLengthCm) : null,
        birthBloodType: birthBloodType || null,
        birthNotes: birthNotes || null,
      });
      setChild(res.data);
      setEditing(false);
      setMessage("Profile updated");
    } catch (err) {
      const body = (
        err as { response?: { status: number; body?: { error?: { message?: string } } } }
      )?.response;
      setError(body?.body?.error?.message || "Failed to update child");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!childId || !child) return;
    if (!confirm(`Archive ${child.name}?`)) return;
    try {
      await archiveChildApi(childId);
      navigate("/children");
    } catch {
      setError("Failed to archive child");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  if (!child)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-red-500">Child not found</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <button
        type="button"
        onClick={() => navigate("/children")}
        className="mb-6 text-sm text-gray-400 hover:text-gray-600"
      >
        &larr; Back to children
      </button>

      {!editing && (
        <div>
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-2xl">
                {child.photoUrl ? (
                  <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  "👶"
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
              <p className="text-sm text-gray-400">
                {child.gender === "male" ? "Boy" : "Girl"} &middot;{" "}
                {new Date(child.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* Birth info */}
          <div className="mt-6 space-y-3 rounded-xl border border-gray-100 bg-white p-5">
            {child.birthWeightG && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Birth Weight</span>
                <span className="font-medium text-gray-700">{child.birthWeightG} g</span>
              </div>
            )}
            {child.birthLengthCm && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Birth Length</span>
                <span className="font-medium text-gray-700">{child.birthLengthCm} cm</span>
              </div>
            )}
            {child.birthBloodType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Blood Type</span>
                <span className="font-medium text-gray-700">{child.birthBloodType}</span>
              </div>
            )}
            {child.birthNotes && (
              <div className="pt-2">
                <p className="text-xs text-gray-400">Birth Notes</p>
                <p className="mt-1 text-sm text-gray-600">{child.birthNotes}</p>
              </div>
            )}
          </div>

          {/* Growth Tracking section */}
          <section className="mt-6 rounded-xl border border-teal-100 bg-teal-50/30 p-5">
            <h2 className="text-sm font-semibold text-teal-800">Growth Tracking</h2>
            {growthSnapshot.totalRecords > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-4 text-sm">
                  {growthSnapshot.latestWeight && (
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <span className="font-medium">{growthSnapshot.latestWeight.value} kg</span>
                      <StatusDot
                        color={
                          growthSnapshot.latestWeight.statusColor as
                            | "green"
                            | "yellow"
                            | "red"
                            | null
                        }
                      />
                      <span className="text-xs text-gray-400">Weight</span>
                    </span>
                  )}
                  {growthSnapshot.latestHeight && (
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <span className="font-medium">{growthSnapshot.latestHeight.value} cm</span>
                      <StatusDot
                        color={
                          growthSnapshot.latestHeight.statusColor as
                            | "green"
                            | "yellow"
                            | "red"
                            | null
                        }
                      />
                      <span className="text-xs text-gray-400">Height</span>
                    </span>
                  )}
                </div>
                {growthSnapshot.lastMeasurementDate && (
                  <p className="text-xs text-gray-400">
                    Last measured:{" "}
                    {new Date(growthSnapshot.lastMeasurementDate).toLocaleDateString()} &middot;{" "}
                    {growthSnapshot.totalRecords} records
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/children/${childId}/growth?add=true`}
                    className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Add Record
                  </Link>
                  <Link
                    to={`/children/${childId}/growth`}
                    className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50"
                  >
                    View History
                  </Link>
                  <Link
                    to={`/children/${childId}/growth/chart/wfa`}
                    className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50"
                  >
                    WHO Chart
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Start tracking your child&apos;s growth by adding the first measurement.
                </p>
                <Link
                  to={`/children/${childId}/growth?add=true`}
                  className="mt-3 inline-block rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Add First Measurement
                </Link>
              </div>
            )}
          </section>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={handleArchive}
              className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Archive
            </button>
          </div>
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave}>
          <h1 className="text-2xl font-bold text-gray-900">Edit Child</h1>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="edit-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="male">Boy</option>
                <option value="female">Girl</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="edit-dob"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-weight" className="block text-sm font-medium text-gray-700">
                  Birth Weight (g)
                </label>
                <input
                  id="edit-weight"
                  type="number"
                  min={500}
                  max={8000}
                  value={birthWeightG}
                  onChange={(e) => setBirthWeightG(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="edit-length" className="block text-sm font-medium text-gray-700">
                  Birth Length (cm)
                </label>
                <input
                  id="edit-length"
                  type="number"
                  min={20}
                  max={70}
                  step={0.1}
                  value={birthLengthCm}
                  onChange={(e) => setBirthLengthCm(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-blood" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <input
                id="edit-blood"
                type="text"
                maxLength={5}
                value={birthBloodType}
                onChange={(e) => setBirthBloodType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                Birth Notes
              </label>
              <textarea
                id="edit-notes"
                rows={3}
                maxLength={1000}
                value={birthNotes}
                onChange={(e) => setBirthNotes(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
