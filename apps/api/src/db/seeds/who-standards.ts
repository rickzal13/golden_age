import { createDb, getDb } from "../../lib/db";
import { measurementReference } from "../../lib/db/schema";

interface WhoRow {
  age_months: number;
  L: number;
  M: number;
  S: number;
}

// WHO Child Growth Standards — LMS parameters
// Source: WHO Multicentre Growth Reference Study Group (2006)

const wfaBoys: WhoRow[] = [
  { age_months: 0, L: 1, M: 3.3464, S: 0.14602 },
  { age_months: 1, L: 1, M: 4.4709, S: 0.13495 },
  { age_months: 2, L: 1, M: 5.5975, S: 0.13485 },
  { age_months: 3, L: 1, M: 6.4037, S: 0.13562 },
  { age_months: 4, L: 1, M: 7.0585, S: 0.13661 },
  { age_months: 5, L: 1, M: 7.6154, S: 0.13767 },
  { age_months: 6, L: 1, M: 8.1029, S: 0.13875 },
  { age_months: 7, L: 1, M: 8.5349, S: 0.13983 },
  { age_months: 8, L: 1, M: 8.9209, S: 0.1409 },
  { age_months: 9, L: 1, M: 9.2677, S: 0.14197 },
  { age_months: 10, L: 1, M: 9.5812, S: 0.14303 },
  { age_months: 11, L: 1, M: 9.8663, S: 0.14408 },
  { age_months: 12, L: 1, M: 10.127, S: 0.14513 },
  { age_months: 13, L: 1, M: 10.367, S: 0.14618 },
  { age_months: 14, L: 1, M: 10.589, S: 0.14721 },
  { age_months: 15, L: 1, M: 10.795, S: 0.14825 },
  { age_months: 16, L: 1, M: 10.986, S: 0.14928 },
  { age_months: 17, L: 1, M: 11.165, S: 0.15031 },
  { age_months: 18, L: 1, M: 11.333, S: 0.15134 },
  { age_months: 19, L: 1, M: 11.49, S: 0.15237 },
  { age_months: 20, L: 1, M: 11.638, S: 0.15339 },
  { age_months: 21, L: 1, M: 11.778, S: 0.15442 },
  { age_months: 22, L: 1, M: 11.91, S: 0.15544 },
  { age_months: 23, L: 1, M: 12.035, S: 0.15647 },
  { age_months: 24, L: 1, M: 12.154, S: 0.15749 },
];
const wfaGirls: WhoRow[] = [
  { age_months: 0, L: 1, M: 3.2322, S: 0.14171 },
  { age_months: 1, L: 1, M: 4.1873, S: 0.13724 },
  { age_months: 2, L: 1, M: 5.1282, S: 0.13 },
  { age_months: 3, L: 1, M: 5.8458, S: 0.12619 },
  { age_months: 4, L: 1, M: 6.4237, S: 0.12402 },
  { age_months: 5, L: 1, M: 6.8985, S: 0.12274 },
  { age_months: 6, L: 1, M: 7.297, S: 0.12204 },
  { age_months: 7, L: 1, M: 7.6422, S: 0.12178 },
  { age_months: 8, L: 1, M: 7.9487, S: 0.12181 },
  { age_months: 9, L: 1, M: 8.2254, S: 0.12199 },
  { age_months: 10, L: 1, M: 8.48, S: 0.12223 },
  { age_months: 11, L: 1, M: 8.7192, S: 0.12247 },
  { age_months: 12, L: 1, M: 8.9481, S: 0.12268 },
  { age_months: 13, L: 1, M: 9.1703, S: 0.12283 },
  { age_months: 14, L: 1, M: 9.388, S: 0.12294 },
  { age_months: 15, L: 1, M: 9.602, S: 0.12299 },
  { age_months: 16, L: 1, M: 9.812, S: 0.12303 },
  { age_months: 17, L: 1, M: 10.019, S: 0.12306 },
  { age_months: 18, L: 1, M: 10.222, S: 0.12309 },
  { age_months: 19, L: 1, M: 10.421, S: 0.12315 },
  { age_months: 20, L: 1, M: 10.617, S: 0.12323 },
  { age_months: 21, L: 1, M: 10.81, S: 0.12335 },
  { age_months: 22, L: 1, M: 11, S: 0.1235 },
  { age_months: 23, L: 1, M: 11.187, S: 0.12369 },
  { age_months: 24, L: 1, M: 11.372, S: 0.1239 },
];
const hfaBoys: WhoRow[] = [
  { age_months: 0, L: 1, M: 49.8842, S: 0.03795 },
  { age_months: 1, L: 1, M: 54.7244, S: 0.03557 },
  { age_months: 2, L: 1, M: 58.4249, S: 0.03424 },
  { age_months: 3, L: 1, M: 61.4292, S: 0.03328 },
  { age_months: 4, L: 1, M: 63.886, S: 0.03257 },
  { age_months: 5, L: 1, M: 65.9026, S: 0.03204 },
  { age_months: 6, L: 1, M: 67.6236, S: 0.03165 },
  { age_months: 7, L: 1, M: 69.1645, S: 0.03139 },
  { age_months: 8, L: 1, M: 70.5995, S: 0.03124 },
  { age_months: 9, L: 1, M: 71.9687, S: 0.03117 },
  { age_months: 10, L: 1, M: 73.2812, S: 0.03118 },
  { age_months: 11, L: 1, M: 74.5388, S: 0.03125 },
  { age_months: 12, L: 1, M: 75.7488, S: 0.03137 },
  { age_months: 13, L: 1, M: 76.9186, S: 0.03154 },
  { age_months: 14, L: 1, M: 78.0497, S: 0.03174 },
  { age_months: 15, L: 1, M: 79.1458, S: 0.03197 },
  { age_months: 16, L: 1, M: 80.2113, S: 0.03222 },
  { age_months: 17, L: 1, M: 81.2487, S: 0.0325 },
  { age_months: 18, L: 1, M: 82.2587, S: 0.03279 },
  { age_months: 19, L: 1, M: 83.2418, S: 0.0331 },
  { age_months: 20, L: 1, M: 84.1996, S: 0.03342 },
  { age_months: 21, L: 1, M: 85.1348, S: 0.03376 },
  { age_months: 22, L: 1, M: 86.0477, S: 0.0341 },
  { age_months: 23, L: 1, M: 86.941, S: 0.03445 },
  { age_months: 24, L: 1, M: 87.8161, S: 0.03479 },
];
const hfaGirls: WhoRow[] = [
  { age_months: 0, L: 1, M: 49.1477, S: 0.0379 },
  { age_months: 1, L: 1, M: 53.6872, S: 0.03636 },
  { age_months: 2, L: 1, M: 57.0673, S: 0.03568 },
  { age_months: 3, L: 1, M: 59.8029, S: 0.0352 },
  { age_months: 4, L: 1, M: 62.0899, S: 0.03486 },
  { age_months: 5, L: 1, M: 64.0301, S: 0.03463 },
  { age_months: 6, L: 1, M: 65.7311, S: 0.03448 },
  { age_months: 7, L: 1, M: 67.2873, S: 0.03441 },
  { age_months: 8, L: 1, M: 68.7498, S: 0.0344 },
  { age_months: 9, L: 1, M: 70.1435, S: 0.03444 },
  { age_months: 10, L: 1, M: 71.4818, S: 0.03452 },
  { age_months: 11, L: 1, M: 72.771, S: 0.03464 },
  { age_months: 12, L: 1, M: 74.015, S: 0.03479 },
  { age_months: 13, L: 1, M: 75.2176, S: 0.03496 },
  { age_months: 14, L: 1, M: 76.3817, S: 0.03514 },
  { age_months: 15, L: 1, M: 77.5099, S: 0.03534 },
  { age_months: 16, L: 1, M: 78.6055, S: 0.03555 },
  { age_months: 17, L: 1, M: 79.671, S: 0.03576 },
  { age_months: 18, L: 1, M: 80.7079, S: 0.03598 },
  { age_months: 19, L: 1, M: 81.7182, S: 0.0362 },
  { age_months: 20, L: 1, M: 82.7036, S: 0.03643 },
  { age_months: 21, L: 1, M: 83.6654, S: 0.03666 },
  { age_months: 22, L: 1, M: 84.604, S: 0.03688 },
  { age_months: 23, L: 1, M: 85.5202, S: 0.03711 },
  { age_months: 24, L: 1, M: 86.4153, S: 0.03734 },
];
const hcfaBoys: WhoRow[] = [
  { age_months: 0, L: 1, M: 34.4618, S: 0.03686 },
  { age_months: 1, L: 1, M: 37.2759, S: 0.03133 },
  { age_months: 2, L: 1, M: 39.1285, S: 0.02997 },
  { age_months: 3, L: 1, M: 40.5135, S: 0.02918 },
  { age_months: 4, L: 1, M: 41.6232, S: 0.02868 },
  { age_months: 5, L: 1, M: 42.5484, S: 0.02837 },
  { age_months: 6, L: 1, M: 43.343, S: 0.02817 },
  { age_months: 7, L: 1, M: 44.0423, S: 0.02807 },
  { age_months: 8, L: 1, M: 44.668, S: 0.02802 },
  { age_months: 9, L: 1, M: 45.2342, S: 0.02802 },
  { age_months: 10, L: 1, M: 45.751, S: 0.02805 },
  { age_months: 11, L: 1, M: 46.2263, S: 0.02811 },
  { age_months: 12, L: 1, M: 46.6659, S: 0.02821 },
  { age_months: 13, L: 1, M: 47.0748, S: 0.02834 },
  { age_months: 14, L: 1, M: 47.4565, S: 0.02849 },
  { age_months: 15, L: 1, M: 47.814, S: 0.02867 },
  { age_months: 16, L: 1, M: 48.15, S: 0.02886 },
  { age_months: 17, L: 1, M: 48.4665, S: 0.02908 },
  { age_months: 18, L: 1, M: 48.765, S: 0.0293 },
  { age_months: 19, L: 1, M: 49.047, S: 0.02954 },
  { age_months: 20, L: 1, M: 49.314, S: 0.02979 },
  { age_months: 21, L: 1, M: 49.567, S: 0.03004 },
  { age_months: 22, L: 1, M: 49.807, S: 0.0303 },
  { age_months: 23, L: 1, M: 50.035, S: 0.03057 },
  { age_months: 24, L: 1, M: 50.253, S: 0.03084 },
];
const hcfaGirls: WhoRow[] = [
  { age_months: 0, L: 1, M: 33.8787, S: 0.03496 },
  { age_months: 1, L: 1, M: 36.5463, S: 0.0321 },
  { age_months: 2, L: 1, M: 38.2521, S: 0.03168 },
  { age_months: 3, L: 1, M: 39.5328, S: 0.0314 },
  { age_months: 4, L: 1, M: 40.5817, S: 0.03119 },
  { age_months: 5, L: 1, M: 41.459, S: 0.03102 },
  { age_months: 6, L: 1, M: 42.2095, S: 0.03087 },
  { age_months: 7, L: 1, M: 42.8683, S: 0.03075 },
  { age_months: 8, L: 1, M: 43.457, S: 0.03063 },
  { age_months: 9, L: 1, M: 43.99, S: 0.03053 },
  { age_months: 10, L: 1, M: 44.477, S: 0.03043 },
  { age_months: 11, L: 1, M: 44.925, S: 0.03033 },
  { age_months: 12, L: 1, M: 45.34, S: 0.03024 },
  { age_months: 13, L: 1, M: 45.726, S: 0.03015 },
  { age_months: 14, L: 1, M: 46.087, S: 0.03006 },
  { age_months: 15, L: 1, M: 46.425, S: 0.02997 },
  { age_months: 16, L: 1, M: 46.743, S: 0.02988 },
  { age_months: 17, L: 1, M: 47.042, S: 0.0298 },
  { age_months: 18, L: 1, M: 47.324, S: 0.02971 },
  { age_months: 19, L: 1, M: 47.59, S: 0.02963 },
  { age_months: 20, L: 1, M: 47.842, S: 0.02955 },
  { age_months: 21, L: 1, M: 48.081, S: 0.02947 },
  { age_months: 22, L: 1, M: 48.307, S: 0.02939 },
  { age_months: 23, L: 1, M: 48.522, S: 0.02931 },
  { age_months: 24, L: 1, M: 48.727, S: 0.02924 },
];

async function seed() {
  const envUrl =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/golden_age";
  createDb({ DATABASE_URL: envUrl } as any);
  const db = getDb();

  const datasets: [string, "male" | "female", WhoRow[]][] = [
    ["wfa", "male", wfaBoys],
    ["wfa", "female", wfaGirls],
    ["hfa", "male", hfaBoys],
    ["hfa", "female", hfaGirls],
    ["hcfa", "male", hcfaBoys],
    ["hcfa", "female", hcfaGirls],
  ];

  for (const [chartType, gender, rows] of datasets) {
    for (const row of rows) {
      await db.insert(measurementReference).values({
        chartType,
        gender,
        ageMonths: row.age_months,
        L: row.L.toString(),
        M: row.M.toString(),
        S: row.S.toString(),
      });
    }
  }

  console.log(
    "WHO data seeded:",
    datasets.reduce((s, [, , r]) => s + r.length, 0),
    "rows",
  );
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
