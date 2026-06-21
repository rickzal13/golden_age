let cachedPublicKey: CryptoKey | null = null;
let cachedPublicKeyBase64: string | null = null;

async function fetchPublicKeyBase64(): Promise<string> {
  if (cachedPublicKeyBase64) return cachedPublicKeyBase64;

  const res = await fetch("/api/v1/auth/public-key");
  if (!res.ok) throw new Error("Failed to fetch public key");

  const data = (await res.json()) as { data: { publicKey: string } };
  cachedPublicKeyBase64 = data.data.publicKey;
  return cachedPublicKeyBase64;
}

async function getPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) return cachedPublicKey;

  const spkiBase64 = await fetchPublicKeyBase64();
  const spkiBytes = Uint8Array.from(atob(spkiBase64), (c) => c.charCodeAt(0));

  cachedPublicKey = await crypto.subtle.importKey(
    "spki",
    spkiBytes,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  return cachedPublicKey;
}

export async function encryptCredential(plaintext: string): Promise<string> {
  const publicKey = await getPublicKey();
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encoded);

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export function clearPublicKeyCache(): void {
  cachedPublicKey = null;
  cachedPublicKeyBase64 = null;
}
