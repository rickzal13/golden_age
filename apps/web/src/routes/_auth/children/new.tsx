import { useState } from "react";
import { useNavigate } from "react-router";
import { createChildApi } from "../../../features/children/api";

export default function AddChildPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [birthWeightG, setBirthWeightG] = useState("");
  const [birthLengthCm, setBirthLengthCm] = useState("");
  const [birthBloodType, setBirthBloodType] = useState("");
  const [birthNotes, setBirthNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createChildApi({
        name,
        dateOfBirth,
        gender,
        birthWeightG: birthWeightG ? Number(birthWeightG) : null,
        birthLengthCm: birthLengthCm ? Number(birthLengthCm) : null,
        birthBloodType: birthBloodType || null,
        birthNotes: birthNotes || null,
      });
      navigate("/children");
    } catch (err) {
      const body = (
        err as { response?: { status: number; body?: { error?: { message?: string } } } }
      )?.response;
      setError(body?.body?.error?.message || "Failed to create child profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Add Child</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Basic Information */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Basic Information</legend>
          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="male">Boy</option>
                <option value="female">Girl</option>
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Optional Information */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Optional Information</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Birth Weight (grams)
              </label>
              <input
                id="weight"
                type="number"
                min={500}
                max={8000}
                value={birthWeightG}
                onChange={(e) => setBirthWeightG(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. 3200"
              />
            </div>
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                Birth Length (cm)
              </label>
              <input
                id="length"
                type="number"
                min={20}
                max={70}
                step={0.1}
                value={birthLengthCm}
                onChange={(e) => setBirthLengthCm(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <input
                id="bloodType"
                type="text"
                maxLength={5}
                value={birthBloodType}
                onChange={(e) => setBirthBloodType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. O+"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Birth Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={1000}
              value={birthNotes}
              onChange={(e) => setBirthNotes(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Any notes about the birth..."
            />
          </div>
        </fieldset>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/children")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
