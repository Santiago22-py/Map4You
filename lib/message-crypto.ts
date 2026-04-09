import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.MESSAGE_ENCRYPTION_KEY?.trim();

  if (!secret) {
    return null;
  }

  return createHash("sha256").update(secret).digest();
}

export function isMessageEncryptionConfigured() {
  return Boolean(getEncryptionKey());
}

export function encryptMessageContent(content: string) {
  const key = getEncryptionKey();

  if (!key) {
    throw new Error("La mensajería cifrada no está configurada.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(content, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptMessageContent(ciphertext: string, iv: string, tag: string) {
  const key = getEncryptionKey();

  if (!key) {
    throw new Error("La mensajería cifrada no está configurada.");
  }

  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]);

  return decrypted.toString("utf8");
}
