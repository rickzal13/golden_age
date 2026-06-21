import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ConfirmationDialog } from "../../../../components/ui/ConfirmationDialog";
import { GrowthSummaryCard } from "../../../../components/ui/GrowthSummaryCard";
import {
  createGrowthRecordApi,
  deleteGrowthRecordApi,
  getGrowthRecordsApi,
  updateGrowthRecordApi,
} from "../../../../features/growth/api";
import { useGrowthSummary } from "../../../../features/growth/hooks/useGrowthSummary";

interface Record {
  id: string;
  type: string;
  value: string;
  unit: string;
  measurementDate: string;
  notes: string | null;
  zScore: string | null;
  percentile: string | null;
  statusColor: string | null;
}

const TABS = [
  { key: "weight", label: "Weight" },
  { key: "height", label: "Height" },
  { key: "head_circumference", label: "Head" },
] as const;

export default function ChildGrowthPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("weight");
  const [showForm, setShowForm] = useState(searchParams.get("add") === "true");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record | null>(null);
  const [type, setType] = useState("weight");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { summary, refetch: refetchSummary } = useGrowthSummary(childId);

  const fetchRecords = () => {
    if (!childId) return;
    getGrowthRecordsApi(childId)
      .then((r) => setRecords(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [childId]);

  const filteredRecords = records.filter((r) => r.type === activeTab);

  const resetForm = () => {
    setType(activeTab);
    setValue("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setError("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    setError("");
    setSaving(true);
    try {
      const unit = type === "weight" ? "kg" : "cm";
      await createGrowthRecordApi(childId, {
        type,
        value: Number(value),
        unit,
        measurementDate: date,
        notes: notes || null,
      });
      resetForm();
      setShowForm(false);
      fetchRecords();
      refetchSummary();
    } catch {
      setError("Failed to add record");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: Record) => {
    setType(record.type);
    setValue(Number(record.value).toString());
    setDate(record.measurementDate.split("T")[0] ?? "");
    setNotes(record.notes || "");
    setEditingRecord(record);
    setShowEditModal(true);
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !editingRecord) return;
    setError("");
    setSaving(true);
    try {
      await updateGrowthRecordApi(childId, editingRecord.id, {
        value: Number(value),
        measurementDate: date,
        notes: notes || null,
      });
      setShowEditModal(false);
      setEditingRecord(null);
      fetchRecords();
      refetchSummary();
    } catch {
      setError("Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!childId || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGrowthRecordApi(childId, deleteTarget.id);
      setDeleteTarget(null);
      fetchRecords();
      refetchSummary();
    } catch {
      setError("Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );

  const statusDot = (color: string | null) => {
    if (!color) return null;
    const bg =
      color === "green" ? "bg-emerald-500" : color === "yellow" ? "bg-amber-500" : "bg-red-500";
    return <span className={`ml-1 inline-block h-2 w-2 rounded-full ${bg}`} />;
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <button
        type="button"
        onClick={() => navigate(`/children/${childId}`)}
        className="mb-4 text-sm text-gray-400 hover:text-gray-600"
      >
        &larr; Back to child
      </button>

      <GrowthSummaryCard
        latestWeight={summary.latestWeight}
        latestHeight={summary.latestHeight}
        lastMeasurementDate={summary.lastMeasurementDate}
        totalRecords={summary.totalRecords}
      />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Growth Records</h1>
        <div className="flex gap-2">
          <Link
            to={`/children/${childId}/growth/chart/wfa`}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Chart
          </Link>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              resetForm();
              setShowForm(false);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-4 rounded-xl border border-gray-100 bg-white p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-700">
            Add {TABS.find((t) => t.key === activeTab)?.label} Record
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gf-value" className="block text-sm font-medium text-gray-700">
                Value ({activeTab === "weight" ? "kg" : "cm"})
              </label>
              <input
                id="gf-value"
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="gf-date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                id="gf-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="gf-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <input
              id="gf-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {/* Records list */}
      {filteredRecords.length === 0 && !showForm ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-sm font-medium text-gray-900">
            No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} records yet
          </p>
          <p className="mt-1 text-sm text-gray-500">Add your first measurement above</p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Add Measurement
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filteredRecords.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {Number(r.value)} {r.unit}
                  </span>
                  {r.statusColor && statusDot(r.statusColor)}
                  {r.percentile && (
                    <span className="text-xs text-gray-400">{Number(r.percentile)}th</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{r.measurementDate.split("T")[0]}</span>
                {r.notes && (
                  <span className="ml-2 hidden sm:inline text-xs text-gray-400">{r.notes}</span>
                )}
              </div>
              <div className="flex shrink-0 gap-1 ml-3">
                <button
                  type="button"
                  onClick={() => handleEdit(r)}
                  className="rounded px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(r)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => {
              setShowEditModal(false);
              setEditingRecord(null);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-xl sm:rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">Edit Record</h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-500">
                  {type === "weight"
                    ? "Weight (kg)"
                    : type === "height"
                      ? "Height (cm)"
                      : "Head Circ. (cm)"}
                </p>
              </div>
              <div>
                <label htmlFor="edit-val" className="block text-sm font-medium text-gray-700">
                  Value
                </label>
                <input
                  id="edit-val"
                  type="number"
                  step="0.01"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <input
                  id="edit-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecord(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Growth Record"
        description={`Delete this ${deleteTarget?.type === "weight" ? "weight" : deleteTarget?.type === "height" ? "height" : "head circumference"} measurement of ${deleteTarget ? `${Number(deleteTarget.value)} ${deleteTarget.unit}` : ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
