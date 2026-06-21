import { constants, privateDecrypt } from "node:crypto";

let privateKeyPem: string | null = null;

export function setDecryptionKey(pem: string): void {
  privateKeyPem = pem;
}

export function decryptCredential(encryptedBase64: string): string {
  if (!privateKeyPem) {
    throw new Error("Decryption key not set. Call setDecryptionKey() first.");
  }

  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decrypted = privateDecrypt(
    {
      key: privateKeyPem,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encrypted,
  );

  return decrypted.toString("utf-8");
}
