import { describe, it, expect } from "vitest";
import {
  decodeBase64Url,
  encodeBase64Url,
  decodeJwt,
  isExpired,
  getExpiryInfo,
  verifyHS256,
  verifyRS256,
  generateJwt,
} from "./jwt-tester.logic";

describe("jwt-tester.logic", () => {
  describe("decodeBase64Url", () => {
    it("should decode base64url string", () => {
      const encoded = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const decoded = decodeBase64Url(encoded);
      expect(decoded).toBe('{"alg":"HS256","typ":"JWT"}');
    });
  });

  describe("encodeBase64Url", () => {
    it("should encode string to base64url", () => {
      const input = '{"alg":"HS256","typ":"JWT"}';
      const encoded = encodeBase64Url(input);
      expect(encoded).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    });

    it("should round-trip encode/decode", () => {
      const original = "Hello, World!";
      const encoded = encodeBase64Url(original);
      const decoded = decodeBase64Url(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("decodeJwt", () => {
    it("should decode valid HS256 JWT", () => {
      // Sample JWT with header {"alg":"HS256","typ":"JWT"} and payload {"sub":"1234567890","name":"John Doe","iat":1516239022}
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const decoded = decodeJwt(token);

      expect(decoded.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(decoded.payload).toEqual({
        sub: "1234567890",
        name: "John Doe",
        iat: 1516239022,
      });
      expect(decoded.signature).toBe(
        "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      );
    });

    it("should throw on malformed JWT with too few parts", () => {
      expect(() => decodeJwt("only.two")).toThrow(
        "Malformed JWT: expected 3 parts"
      );
    });

    it("should throw on malformed JWT with too many parts", () => {
      expect(() => decodeJwt("one.two.three.four")).toThrow(
        "Malformed JWT: expected 3 parts"
      );
    });

    it("should throw on invalid base64 in header", () => {
      expect(() => decodeJwt("!!!invalid!!.payload.signature")).toThrow(
        "Failed to decode JWT"
      );
    });

    it("should throw on empty string", () => {
      expect(() => decodeJwt("")).toThrow("Malformed JWT");
    });

    it("should handle JWT with extra dots gracefully", () => {
      expect(() => decodeJwt("a.b.c.d")).toThrow("Malformed JWT");
    });
  });

  describe("isExpired", () => {
    it("should return false for token without exp claim", () => {
      const payload = { sub: "user123" };
      expect(isExpired(payload)).toBe(false);
    });

    it("should return true for expired token", () => {
      const payload = { exp: Math.floor(Date.now() / 1000) - 3600 }; // 1 hour ago
      expect(isExpired(payload)).toBe(true);
    });

    it("should return false for non-expired token", () => {
      const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour from now
      expect(isExpired(payload)).toBe(false);
    });

    it("should handle exp: 0 correctly", () => {
      const payload = { exp: 0 };
      expect(isExpired(payload)).toBe(true);
    });

    it("should handle null exp correctly", () => {
      const payload = { exp: null as any };
      expect(isExpired(payload)).toBe(false);
    });

    it("should handle undefined exp correctly", () => {
      const payload = { exp: undefined as any };
      expect(isExpired(payload)).toBe(false);
    });
  });

  describe("getExpiryInfo", () => {
    it("should extract expiry and issued-at timestamps", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now + 3600, iat: now };

      const info = getExpiryInfo(payload);

      expect(info.expired).toBe(false);
      expect(info.expiresAt).toEqual(new Date((now + 3600) * 1000));
      expect(info.issuedAt).toEqual(new Date(now * 1000));
    });

    it("should return null timestamps when claims are missing", () => {
      const payload = {};
      const info = getExpiryInfo(payload);

      expect(info.expired).toBe(false);
      expect(info.expiresAt).toBe(null);
      expect(info.issuedAt).toBe(null);
    });

    it("should handle exp: 0 and iat: 0 correctly", () => {
      const payload = { exp: 0, iat: 0 };
      const info = getExpiryInfo(payload);

      expect(info.expired).toBe(true);
      expect(info.expiresAt).toEqual(new Date(0));
      expect(info.issuedAt).toEqual(new Date(0));
    });

    it("should handle null exp and iat correctly", () => {
      const payload = { exp: null as any, iat: null as any };
      const info = getExpiryInfo(payload);

      expect(info.expired).toBe(false);
      expect(info.expiresAt).toBe(null);
      expect(info.issuedAt).toBe(null);
    });
  });

  describe("verifyHS256", () => {
    it("should verify valid HS256 signature", async () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const secret = "your-256-bit-secret";

      const isValid = await verifyHS256(token, secret);
      expect(isValid).toBe(true);
    });

    it("should reject invalid HS256 signature with wrong secret", async () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const wrongSecret = "wrong-secret";

      const isValid = await verifyHS256(token, wrongSecret);
      expect(isValid).toBe(false);
    });

    it("should throw on malformed JWT", async () => {
      await expect(verifyHS256("malformed", "secret")).rejects.toThrow(
        "Malformed JWT"
      );
    });

    it("should throw on token with non-HS256 algorithm", async () => {
      const token =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const secret = "your-256-bit-secret";

      await expect(verifyHS256(token, secret)).rejects.toThrow(
        "Invalid algorithm: expected HS256, got RS256"
      );
    });
  });

  describe("verifyRS256", () => {
    it("should throw on token with non-RS256 algorithm", async () => {
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
MwIDAQAB
-----END PUBLIC KEY-----`;

      const hs256Token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      await expect(verifyRS256(hs256Token, publicKeyPem)).rejects.toThrow(
        "Invalid algorithm: expected RS256, got HS256"
      );
    });

    it("should throw on malformed JWT", async () => {
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
MwIDAQAB
-----END PUBLIC KEY-----`;

      await expect(verifyRS256("malformed", publicKeyPem)).rejects.toThrow(
        "Malformed JWT"
      );
    });
  });

  describe("generateJwt", () => {
    it("should generate a valid HS256 JWT", async () => {
      const header = { alg: "HS256", typ: "JWT" };
      const payload = { sub: "1234567890", name: "John Doe", iat: 1516239022 };
      const secret = "your-256-bit-secret";

      const token = await generateJwt(header, payload, secret);

      // Verify the generated token
      const isValid = await verifyHS256(token, secret);
      expect(isValid).toBe(true);

      // Decode and check contents
      const decoded = decodeJwt(token);
      expect(decoded.header).toEqual(header);
      expect(decoded.payload).toEqual(payload);
    });

    it("should round-trip generate and verify", async () => {
      const header = { alg: "HS256", typ: "JWT" };
      const payload = { userId: 42, admin: true };
      const secret = "test-secret";

      const token = await generateJwt(header, payload, secret);
      const isValid = await verifyHS256(token, secret);

      expect(isValid).toBe(true);
    });

    it("should override alg header to HS256 even if different value is provided", async () => {
      const header = { alg: "RS256", typ: "JWT" };
      const payload = { sub: "1234567890", name: "John Doe" };
      const secret = "your-256-bit-secret";

      const token = await generateJwt(header, payload, secret);

      const decoded = decodeJwt(token);
      // Header should be overridden to HS256
      expect((decoded.header as { alg: string }).alg).toBe("HS256");

      // Should verify as HS256
      const isValid = await verifyHS256(token, secret);
      expect(isValid).toBe(true);
    });
  });
});
