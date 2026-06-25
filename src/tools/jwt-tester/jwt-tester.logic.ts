export function decodeBase64Url(input: string): string {
  // Replace base64url characters with base64 equivalents
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");

  // Pad with '=' to make length a multiple of 4
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(padLength);

  // Decode base64 to UTF-8
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function encodeBase64Url(input: string): string {
  // Encode UTF-8 to base64
  const base64 = btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  // Convert base64 to base64url
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface DecodedJwt {
  header: object;
  payload: object;
  signature: string;
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `Malformed JWT: expected 3 parts separated by dots, got ${parts.length}`
    );
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const headerJson = decodeBase64Url(headerB64);
    const header = JSON.parse(headerJson);

    const payloadJson = decodeBase64Url(payloadB64);
    const payload = JSON.parse(payloadJson);

    return {
      header,
      payload,
      signature: signatureB64,
    };
  } catch (e) {
    throw new Error(
      `Failed to decode JWT: ${e instanceof Error ? e.message : String(e)}`,
      { cause: e }
    );
  }
}

export function isExpired(payload: object): boolean {
  const exp = (payload as { exp?: number }).exp;
  if (!exp) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp < nowSeconds;
}

export interface ExpiryInfo {
  expired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

export function getExpiryInfo(payload: object): ExpiryInfo {
  const exp = (payload as { exp?: number }).exp;
  const iat = (payload as { iat?: number }).iat;

  return {
    expired: isExpired(payload),
    expiresAt: exp ? new Date(exp * 1000) : null,
    issuedAt: iat ? new Date(iat * 1000) : null,
  };
}

async function base64UrlToArrayBuffer(base64Url: string): Promise<ArrayBuffer> {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + "=".repeat(padLength);

  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function verifyHS256(
  token: string,
  secret: string
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWT");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;

  // Import secret as HMAC key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the data
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  // Compare signatures
  const computedSignatureB64 = arrayBufferToBase64Url(signature);
  return computedSignatureB64 === signatureB64;
}

export async function verifyRS256(
  token: string,
  publicKeyPem: string
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWT");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;

  // Parse PEM and import as SPKI public key
  const pemContents = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s/g, "");

  const binaryDer = atob(pemContents);
  const derBytes = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    derBytes[i] = binaryDer.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    "spki",
    derBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Decode signature
  const signatureBuffer = await base64UrlToArrayBuffer(signatureB64);

  // Verify signature
  const encoder = new TextEncoder();
  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signatureBuffer,
    encoder.encode(data)
  );

  return isValid;
}

export async function generateJwt(
  header: object,
  payload: object,
  secret: string
): Promise<string> {
  const headerJson = JSON.stringify(header);
  const payloadJson = JSON.stringify(payload);

  const headerB64 = encodeBase64Url(headerJson);
  const payloadB64 = encodeBase64Url(payloadJson);

  const data = `${headerB64}.${payloadB64}`;

  // Import secret as HMAC key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the data
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = arrayBufferToBase64Url(signature);

  return `${data}.${signatureB64}`;
}
