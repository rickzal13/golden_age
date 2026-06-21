/**
 * Calculate corrected age for preterm infants.
 * For babies born at less than 37 weeks gestation, corrected age should be used
 * until 24 months chronological age.
 */
export function calculateCorrectedAge(
  dateOfBirth: Date,
  measurementDate: Date,
  gestationalAgeWeeks: number | null,
): { correctedAgeDays: number; correctedAgeMonths: number; useCorrectedAge: boolean } {
  const chronologicalDays = Math.floor(
    (measurementDate.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24),
  );

  const chronologicalMonths = chronologicalDays / 30.4375;

  if (gestationalAgeWeeks !== null && gestationalAgeWeeks < 37 && chronologicalMonths < 24) {
    const weeksPremature = 40 - gestationalAgeWeeks;
    const daysPremature = weeksPremature * 7;
    const correctedDays = Math.max(0, chronologicalDays - daysPremature);
    const correctedMonths = correctedDays / 30.4375;

    return {
      correctedAgeDays: correctedDays,
      correctedAgeMonths: Math.round(correctedMonths * 10) / 10,
      useCorrectedAge: true,
    };
  }

  return {
    correctedAgeDays: chronologicalDays,
    correctedAgeMonths: Math.round(chronologicalMonths * 10) / 10,
    useCorrectedAge: false,
  };
}

/**
 * Calculate chronological age in months from date of birth.
 */
export function calculateAgeMonths(dateOfBirth: Date, referenceDate: Date = new Date()): number {
  const days = (referenceDate.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round((days / 30.4375) * 10) / 10;
}
