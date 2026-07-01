import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  decodeJwt,
  getExpiryInfo,
  verifyHS256,
  verifyRS256,
  generateJwt,
} from "./jwt-tester.logic";
import type { DecodedJwt } from "./jwt-tester.logic";

const STANDARD_CLAIMS = {
  exp: "Expiration Time",
  iat: "Issued At",
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  nbf: "Not Before",
  jti: "JWT ID",
} as const;

function StandardClaimsDisplay({ payload }: { payload: object }) {
  const standardClaimEntries = Object.entries(STANDARD_CLAIMS).filter(
    ([key]) => key in payload
  );

  if (standardClaimEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 p-3 border border-retro-cyan bg-retro-surface rounded">
      <h4 className="text-sm font-bold text-retro-cyan">Standard Claims</h4>
      {standardClaimEntries.map(([key, label]) => {
        const value = (payload as Record<string, unknown>)[key];
        let displayValue: string;

        if (key === "exp" || key === "iat" || key === "nbf") {
          displayValue = typeof value === "number"
            ? new Date(value * 1000).toLocaleString()
            : String(value ?? "");
        } else {
          displayValue = String(value ?? "");
        }

        return (
          <div key={key} className="text-sm">
            <span className="text-retro-muted">{label} ({key}):</span>{" "}
            <span className="font-mono">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

function CustomClaimsDisplay({ payload }: { payload: object }) {
  const customClaims = Object.fromEntries(
    Object.entries(payload).filter(([key]) => !(key in STANDARD_CLAIMS))
  );

  if (Object.keys(customClaims).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="custom-claims">Custom Claims</Label>
      <Textarea
        id="custom-claims"
        value={JSON.stringify(customClaims, null, 2)}
        readOnly
        rows={6}
      />
    </div>
  );
}

export default function JwtTester() {
  const [activeTab, setActiveTab] = useState<"decode" | "verify" | "generate">(
    "decode"
  );

  // Decode tab state
  const [decodeInput, setDecodeInput] = useState("");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedSignature, setDecodedSignature] = useState("");
  const [expiryStatus, setExpiryStatus] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);

  // Verify tab state
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyAlgorithm, setVerifyAlgorithm] = useState<"HS256" | "RS256">(
    "HS256"
  );
  const [verifySecret, setVerifySecret] = useState("");
  const [verifyPublicKey, setVerifyPublicKey] = useState("");
  const [verifyResult, setVerifyResult] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [showVerifySecret, setShowVerifySecret] = useState(false);
  const [showVerifyPublicKey, setShowVerifyPublicKey] = useState(false);

  // Generate tab state
  const [generateHeader, setGenerateHeader] = useState(
    '{\n  "alg": "HS256",\n  "typ": "JWT"\n}'
  );
  const [generatePayload, setGeneratePayload] = useState(
    '{\n  "sub": "1234567890",\n  "name": "John Doe"\n}'
  );
  const [generateSecret, setGenerateSecret] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [showGenerateSecret, setShowGenerateSecret] = useState(false);

  function handleDecodeInputChange(value: string) {
    setDecodeInput(value);
    setDecodeError("");

    if (!value.trim()) {
      setDecodedHeader("");
      setDecodedSignature("");
      setExpiryStatus("");
      setDecodedJwt(null);
      return;
    }

    try {
      const decoded = decodeJwt(value);
      setDecodedHeader(JSON.stringify(decoded.header, null, 2));
      setDecodedSignature(decoded.signature);
      setDecodedJwt(decoded);

      const expiry = getExpiryInfo(decoded.payload);
      if (expiry.expiresAt) {
        if (expiry.expired) {
          setExpiryStatus(
            `Expired at ${expiry.expiresAt.toLocaleString()}`
          );
        } else {
          setExpiryStatus(`Valid until ${expiry.expiresAt.toLocaleString()}`);
        }
      } else {
        setExpiryStatus("No expiration");
      }
    } catch (e) {
      setDecodeError((e as Error).message);
      setDecodedHeader("");
      setDecodedSignature("");
      setExpiryStatus("");
      setDecodedJwt(null);
    }
  }

  async function handleVerify() {
    setVerifyError("");
    setVerifyResult("");

    if (!verifyToken.trim()) {
      setVerifyError("Please enter a JWT token");
      return;
    }

    try {
      let isValid: boolean;
      if (verifyAlgorithm === "HS256") {
        if (!verifySecret.trim()) {
          setVerifyError("Please enter a secret for HS256");
          return;
        }
        isValid = await verifyHS256(verifyToken, verifySecret);
      } else {
        if (!verifyPublicKey.trim()) {
          setVerifyError("Please enter a public key for RS256");
          return;
        }
        isValid = await verifyRS256(verifyToken, verifyPublicKey);
      }

      setVerifyResult(isValid ? "Valid" : "Invalid");
    } catch (e) {
      setVerifyError((e as Error).message);
    }
  }

  async function handleGenerate() {
    setGenerateError("");
    setGeneratedToken("");

    try {
      const header = JSON.parse(generateHeader);
      const payload = JSON.parse(generatePayload);

      if (!generateSecret.trim()) {
        setGenerateError("Please enter a secret");
        return;
      }

      const token = await generateJwt(header, payload, generateSecret);
      setGeneratedToken(token);
    } catch (e) {
      setGenerateError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-retro-muted pb-2">
        <Button
          onClick={() => setActiveTab("decode")}
          className={activeTab === "decode" ? "bg-retro-cyan text-black" : ""}
        >
          Decode
        </Button>
        <Button
          onClick={() => setActiveTab("verify")}
          className={activeTab === "verify" ? "bg-retro-cyan text-black" : ""}
        >
          Verify
        </Button>
        <Button
          onClick={() => setActiveTab("generate")}
          className={
            activeTab === "generate" ? "bg-retro-cyan text-black" : ""
          }
        >
          Generate
        </Button>
      </div>

      {/* Decode tab */}
      {activeTab === "decode" && (
        <div className="space-y-4">
          {decodeError && (
            <p className="text-retro-magenta text-sm" role="alert">
              {decodeError}
            </p>
          )}

          <div>
            <Label htmlFor="decode-input">JWT Token</Label>
            <Textarea
              id="decode-input"
              value={decodeInput}
              onChange={(e) => handleDecodeInputChange(e.target.value)}
              placeholder="Paste JWT token here..."
              rows={4}
            />
          </div>

          {expiryStatus && (
            <p
              className={`text-sm ${
                expiryStatus.startsWith("Expired")
                  ? "text-retro-magenta"
                  : expiryStatus.startsWith("Valid")
                    ? "text-retro-green"
                    : "text-retro-cyan"
              }`}
            >
              {expiryStatus}
            </p>
          )}

          {decodedJwt && (
            <>
              <StandardClaimsDisplay payload={decodedJwt.payload} />
              <CustomClaimsDisplay payload={decodedJwt.payload} />
            </>
          )}

          <div>
            <Label htmlFor="decoded-header">Header</Label>
            <Textarea
              id="decoded-header"
              value={decodedHeader}
              readOnly
              placeholder="Decoded header will appear here..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="decoded-signature">Signature (base64url)</Label>
            <Textarea
              id="decoded-signature"
              value={decodedSignature}
              readOnly
              placeholder="Signature will appear here..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Verify tab */}
      {activeTab === "verify" && (
        <div className="space-y-4">
          {verifyError && (
            <p className="text-retro-magenta text-sm" role="alert">
              {verifyError}
            </p>
          )}

          {verifyResult && (
            <p
              className={`text-sm font-bold ${
                verifyResult === "Valid"
                  ? "text-retro-green"
                  : "text-retro-magenta"
              }`}
            >
              Signature: {verifyResult}
            </p>
          )}

          <div>
            <Label htmlFor="verify-token">JWT Token</Label>
            <Textarea
              id="verify-token"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Paste JWT token here..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="verify-algorithm">Algorithm</Label>
            <div className="flex gap-2 mt-1">
              <Button
                onClick={() => setVerifyAlgorithm("HS256")}
                className={
                  verifyAlgorithm === "HS256" ? "bg-retro-cyan text-black" : ""
                }
              >
                HS256
              </Button>
              <Button
                onClick={() => setVerifyAlgorithm("RS256")}
                className={
                  verifyAlgorithm === "RS256" ? "bg-retro-cyan text-black" : ""
                }
              >
                RS256
              </Button>
            </div>
          </div>

          {verifyAlgorithm === "HS256" ? (
            <div>
              <Label htmlFor="verify-secret">Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-secret"
                  type={showVerifySecret ? "text" : "password"}
                  value={verifySecret}
                  onChange={(e) => setVerifySecret(e.target.value)}
                  placeholder="Enter HMAC secret..."
                />
                <Button
                  type="button"
                  onClick={() => setShowVerifySecret(!showVerifySecret)}
                  className="px-3"
                >
                  {showVerifySecret ? "🙈" : "👁️"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="verify-public-key">Public Key (PEM)</Label>
              <div className="flex gap-2">
                <Textarea
                  id="verify-public-key"
                  value={verifyPublicKey}
                  onChange={(e) => setVerifyPublicKey(e.target.value)}
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  rows={8}
                  className={showVerifyPublicKey ? "" : "blur-sm"}
                />
                <Button
                  type="button"
                  onClick={() => setShowVerifyPublicKey(!showVerifyPublicKey)}
                  className="px-3 h-fit"
                >
                  {showVerifyPublicKey ? "🙈" : "👁️"}
                </Button>
              </div>
            </div>
          )}

          <Button onClick={handleVerify}>Verify Signature</Button>
        </div>
      )}

      {/* Generate tab */}
      {activeTab === "generate" && (
        <div className="space-y-4">
          {generateError && (
            <p className="text-retro-magenta text-sm" role="alert">
              {generateError}
            </p>
          )}

          <div>
            <Label htmlFor="generate-header">Header JSON</Label>
            <Textarea
              id="generate-header"
              value={generateHeader}
              onChange={(e) => setGenerateHeader(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="generate-payload">Payload JSON</Label>
            <Textarea
              id="generate-payload"
              value={generatePayload}
              onChange={(e) => setGeneratePayload(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="generate-secret">Secret</Label>
            <div className="flex gap-2">
              <Input
                id="generate-secret"
                type={showGenerateSecret ? "text" : "password"}
                value={generateSecret}
                onChange={(e) => setGenerateSecret(e.target.value)}
                placeholder="Enter HMAC secret..."
              />
              <Button
                type="button"
                onClick={() => setShowGenerateSecret(!showGenerateSecret)}
                className="px-3"
              >
                {showGenerateSecret ? "🙈" : "👁️"}
              </Button>
            </div>
          </div>

          <Button onClick={handleGenerate}>Generate JWT</Button>

          {generatedToken && (
            <div>
              <Label htmlFor="generated-token">Generated Token</Label>
              <Textarea
                id="generated-token"
                value={generatedToken}
                readOnly
                rows={6}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
