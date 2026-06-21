export const COUNTRIES = [
  { code: "ID", name: "Indonesia" },
  { code: "IN", name: "India" },
  { code: "PH", name: "Philippines" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
] as const;

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "id", name: "Bahasa Indonesia" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export type LanguageCode = (typeof LANGUAGES)[number]["code"];
