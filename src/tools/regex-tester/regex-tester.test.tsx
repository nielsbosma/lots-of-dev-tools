import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegexTester from "./regex-tester";

describe("RegexTester", () => {
  it("renders the match count when typing a pattern and test string", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);

    await user.type(screen.getByLabelText(/pattern/i), "o");
    await user.type(screen.getByLabelText(/test string/i), "foo boo");

    expect(await screen.findByText(/4 matches/i)).toBeInTheDocument();
  });

  it("changes the result when the i flag is toggled", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);

    await user.type(screen.getByLabelText(/pattern/i), "abc");
    await user.type(screen.getByLabelText(/test string/i), "ABC abc");

    expect(await screen.findByText(/1 match\b/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "i" }));

    expect(await screen.findByText(/2 matches/i)).toBeInTheDocument();
  });

  it("renders an invalid pattern error with role=alert", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);

    await user.type(screen.getByLabelText(/pattern/i), "(");
    await user.type(screen.getByLabelText(/test string/i), "abc");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("copies the replace result to the clipboard", async () => {
    const user = userEvent.setup();
    render(<RegexTester />);

    await user.type(screen.getByLabelText(/pattern/i), "o");
    await user.type(screen.getByLabelText(/test string/i), "foo");
    await user.type(screen.getByLabelText(/replace with/i), "0");

    // Install the clipboard stub after typing: user-event's own typing
    // implementation installs its own navigator.clipboard stub on first use,
    // which would otherwise clobber one set up earlier.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const copyButton = await screen.findByRole("button", { name: /copy/i });
    await user.click(copyButton);

    // Wait for the async clipboard write to resolve and flip the button label
    // before asserting on the mock — the click handler is async internally.
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("f00");
  });
});
