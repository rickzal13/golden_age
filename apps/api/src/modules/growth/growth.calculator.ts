export interface WhoLmsRow {
  age_months: number;
  L: number;
  M: number;
  S: number;
}

let _cache: Record<string, Record<string, WhoLmsRow[]>> | null = null;

async function loadWhoData(): Promise<Record<string, Record<string, WhoLmsRow[]>>> {
  if (_cache) return _cache;
  const files: Record<string, [string, string]> = {
    wfa: ["wfa-boys", "wfa-girls"],
    hfa: ["hfa-boys", "hfa-girls"],
    hcfa: ["hcfa-boys", "hcfa-girls"],
  };
  _cache = {};
  for (const [chartType, [maleFile, femaleFile]] of Object.entries(files)) {
    const male = (await import(`../../../../../packages/shared/src/who-data/${maleFile}.json`)) as {
      default: WhoLmsRow[];
    };
    const female = (await import(
      `../../../../../packages/shared/src/who-data/${femaleFile}.json`
    )) as { default: WhoLmsRow[] };
    _cache[chartType] = { male: male.default, female: female.default };
  }
  return _cache;
}

export function computeZscore(measurement: number, lms: WhoLmsRow): number {
  if (lms.L === 0) return Math.log(measurement / lms.M) / lms.S;
  return ((measurement / lms.M) ** lms.L - 1) / (lms.L * lms.S);
}

export async function getWhoData(
  chartType: string,
  gender: "male" | "female",
): Promise<WhoLmsRow[] | null> {
  const data = await loadWhoData();
  return data[chartType]?.[gender] ?? null;
}

export function getLmsAtAge(data: WhoLmsRow[], ageMonths: number): WhoLmsRow {
  if (data.length === 0) throw new Error("No WHO data");
  if (ageMonths <= (data[0]?.age_months ?? 0)) return data[0] as WhoLmsRow;
  const last = data[data.length - 1];
  if (last && ageMonths >= last.age_months) return last;

  for (let i = 0; i < data.length - 1; i++) {
    const cur = data[i];
    const nxt = data[i + 1];
    if (cur && nxt && ageMonths >= cur.age_months && ageMonths <= nxt.age_months) {
      const ratio = (ageMonths - cur.age_months) / (nxt.age_months - cur.age_months);
      return {
        age_months: ageMonths,
        L: cur.L + ratio * (nxt.L - cur.L),
        M: cur.M + ratio * (nxt.M - cur.M),
        S: cur.S + ratio * (nxt.S - cur.S),
      };
    }
  }
  return (last ?? data[0]) as WhoLmsRow;
}
