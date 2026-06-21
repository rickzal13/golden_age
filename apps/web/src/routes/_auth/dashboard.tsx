import type { Child } from "@golden-age/shared";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { StatusDot } from "../../components/ui/StatusDot";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { getChildrenApi } from "../../features/children/api";
import { getGrowthSummaryApi } from "../../features/growth/api";
import type { GrowthSummary } from "../../features/growth/hooks/useGrowthSummary";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [growthSummaries, setGrowthSummaries] = useState<Record<string, GrowthSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildrenApi()
      .then(async (res) => {
        setChildren(res.data);
        const summaries: Record<string, GrowthSummary> = {};
        await Promise.all(
          res.data.map(async (child) => {
            try {
              const result = await getGrowthSummaryApi(child.id);
              summaries[child.id] = result.data;
            } catch {
              summaries[child.id] = {
                latestWeight: null,
                latestHeight: null,
                lastMeasurementDate: null,
                totalRecords: 0,
              };
            }
          }),
        );
        setGrowthSummaries(summaries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "Parent";

  const ageLabel = (dob: string) => {
    const months = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.4375),
    );
    if (months < 2) return `${Math.floor(months * 4.3)} weeks`;
    if (months < 24) return `${months} months`;
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    return remaining > 0 ? `${years}y ${remaining}m` : `${years} years`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {firstName}</h1>
        <p className="mt-1 text-sm text-gray-500">Track your child&apos;s growth and development</p>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Children</h2>
          <Link
            to="/children/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Add Child
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <div className="text-4xl">👶</div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              You haven&apos;t added any children yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Start your journey by creating your child&apos;s profile
            </p>
            <Link
              to="/children/new"
              className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Add Your First Child
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {children.map((child) => {
              const summary = growthSummaries[child.id];
              return (
                <div
                  key={child.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
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
                        {ageLabel(child.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-50 pt-3">
                    {summary?.latestWeight || summary?.latestHeight ? (
                      <div className="flex gap-4 text-xs text-gray-500">
                        {summary.latestWeight && (
                          <span className="inline-flex items-center gap-1">
                            {summary.latestWeight.value} kg{" "}
                            <StatusDot
                              color={
                                summary.latestWeight.statusColor as
                                  | "green"
                                  | "yellow"
                                  | "red"
                                  | null
                              }
                            />
                          </span>
                        )}
                        {summary.latestHeight && (
                          <span className="inline-flex items-center gap-1">
                            {summary.latestHeight.value} cm{" "}
                            <StatusDot
                              color={
                                summary.latestHeight.statusColor as
                                  | "green"
                                  | "yellow"
                                  | "red"
                                  | null
                              }
                            />
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300">No growth records yet</p>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/children/${child.id}`)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50"
                    >
                      View Profile
                    </button>
                    <Link
                      to={`/children/${child.id}/growth`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-teal-600"
                    >
                      Growth
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <Link
            to="/children/new"
            className="rounded-xl border border-teal-100 bg-teal-50 p-5 transition-shadow hover:shadow-sm"
          >
            <div className="text-xl">👶</div>
            <p className="mt-2 text-sm font-semibold text-teal-800">Add Child</p>
            <p className="mt-1 text-xs text-teal-600">Create a new child profile</p>
          </Link>
          <Link
            to="/children"
            className="rounded-xl border border-teal-100 bg-teal-50 p-5 transition-shadow hover:shadow-sm"
          >
            <div className="text-xl">👨‍👩‍👧‍👦</div>
            <p className="mt-2 text-sm font-semibold text-teal-800">My Children</p>
            <p className="mt-1 text-xs text-teal-600">Manage child profiles</p>
          </Link>
          <Link
            to="/profile"
            className="rounded-xl border border-teal-100 bg-teal-50 p-5 transition-shadow hover:shadow-sm"
          >
            <div className="text-xl">⚙️</div>
            <p className="mt-2 text-sm font-semibold text-teal-800">My Profile</p>
            <p className="mt-1 text-xs text-teal-600">Update account settings</p>
          </Link>
          <div className="hidden rounded-xl border border-gray-100 bg-white p-4 opacity-60 sm:block">
            <div className="text-xl">💉</div>
            <p className="mt-2 text-xs font-medium text-gray-400">Vaccinations</p>
            <p className="mt-1 text-xs text-gray-300">Coming soon</p>
          </div>
        </div>
      </section>
    </div>
  );
}
