import type { Child } from "@golden-age/shared";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { archiveChildApi, getChildrenApi } from "../../../features/children/api";

export default function ChildrenListPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getChildrenApi()
      .then((res) => setChildren(res.data))
      .catch(() => setError("Failed to load children"))
      .finally(() => setLoading(false));
  }, []);

  const handleArchive = async (childId: string, name: string) => {
    if (!confirm(`Archive ${name}? You can restore later.`)) return;
    try {
      await archiveChildApi(childId);
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    } catch {
      setError("Failed to archive child");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <Link
          to="/children/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Add Child
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {children.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="text-4xl">👶</div>
          <p className="mt-4 text-sm text-gray-500">No children added yet</p>
          <Link
            to="/children/new"
            className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Add your first child
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg">
                {child.photoUrl ? (
                  <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  "👶"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{child.name}</p>
                <p className="text-xs text-gray-400">
                  {child.gender === "male" ? "Boy" : "Girl"} &middot;{" "}
                  {new Date(child.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/children/${child.id}`)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(child.id, child.name)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-red-500"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
