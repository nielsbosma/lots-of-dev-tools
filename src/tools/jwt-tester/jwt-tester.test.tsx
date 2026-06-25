import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JwtTester from "./jwt-tester";

describe("JwtTester", () => {
  it("should render all tabs", () => {
    render(<JwtTester />);

    expect(screen.getByRole("button", { name: "Decode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate" })
    ).toBeInTheDocument();
  });

  it("should decode a JWT and display header and payload", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    // Sample JWT
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const input = screen.getByLabelText("JWT Token");
    await user.type(input, token);

    // Check decoded output
    const headerTextarea = screen.getByLabelText("Header");
    expect(headerTextarea).toHaveValue(
      expect.stringContaining('"alg": "HS256"')
    );

    const payloadTextarea = screen.getByLabelText("Payload");
    expect(payloadTextarea).toHaveValue(
      expect.stringContaining('"name": "John Doe"')
    );

    const signatureTextarea = screen.getByLabelText("Signature (base64url)");
    expect(signatureTextarea).toHaveValue(
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
  });

  it("should show expired status for expired tokens", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    // JWT with expired timestamp (exp in the past)
    const expiredPayload = {
      sub: "1234567890",
      name: "John Doe",
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    };
    const header = { alg: "HS256", typ: "JWT" };

    // Manually construct a JWT with expired payload
    const base64UrlEncode = (obj: object) => {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };
    const expiredToken = `${base64UrlEncode(header)}.${base64UrlEncode(expiredPayload)}.fake_signature`;

    const input = screen.getByLabelText("JWT Token");
    await user.type(input, expiredToken);

    expect(screen.getByText(/Expired at/)).toBeInTheDocument();
  });

  it("should show valid status for non-expired tokens", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    // JWT with future expiry
    const validPayload = {
      sub: "1234567890",
      name: "John Doe",
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    const header = { alg: "HS256", typ: "JWT" };

    const base64UrlEncode = (obj: object) => {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };
    const validToken = `${base64UrlEncode(header)}.${base64UrlEncode(validPayload)}.fake_signature`;

    const input = screen.getByLabelText("JWT Token");
    await user.type(input, validToken);

    expect(screen.getByText(/Valid until/)).toBeInTheDocument();
  });

  it("should handle invalid JWT input with error message", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    const input = screen.getByLabelText("JWT Token");
    await user.type(input, "invalid.jwt");

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Malformed JWT|Failed to decode JWT/
    );
  });

  it("should verify button reports signature valid/invalid", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    // Switch to Verify tab
    await user.click(screen.getByRole("button", { name: "Verify" }));

    // Valid token
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const secret = "your-256-bit-secret";

    const tokenInput = screen.getByLabelText("JWT Token");
    await user.type(tokenInput, token);

    const secretInput = screen.getByLabelText("Secret");
    await user.type(secretInput, secret);

    const verifyButton = screen.getByRole("button", {
      name: "Verify Signature",
    });
    await user.click(verifyButton);

    // Wait for async verification
    expect(
      await screen.findByText("Signature: Valid", {}, { timeout: 2000 })
    ).toBeInTheDocument();
  });

  it("should generate button produces a JWT string", async () => {
    const user = userEvent.setup();
    render(<JwtTester />);

    // Switch to Generate tab
    await user.click(screen.getByRole("button", { name: "Generate" }));

    const secretInput = screen.getByLabelText("Secret");
    await user.type(secretInput, "test-secret");

    const generateButton = screen.getByRole("button", { name: "Generate JWT" });
    await user.click(generateButton);

    // Wait for generated token
    const generatedTokenTextarea =
      await screen.findByLabelText("Generated Token");
    expect(generatedTokenTextarea).toHaveValue(expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/));
  });
});
