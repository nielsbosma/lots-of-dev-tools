import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlugGenerator from "./slug-generator";

describe("SlugGenerator", () => {
  it("renders input and output textareas", () => {
    render(<SlugGenerator />);
    expect(screen.getByLabelText(/input text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
  });

  it("generates slug on typing (live conversion)", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/slug/i);

    await user.type(input, "Hello World");

    expect(output).toHaveValue("hello-world");
  });

  it("generates slug on button click", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/slug/i);

    await user.type(input, "Hello World");
    await user.click(screen.getByRole("button", { name: /generate slug/i }));

    expect(output).toHaveValue("hello-world");
  });

  it("handles empty input", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const output = screen.getByLabelText(/slug/i);

    await user.click(screen.getByRole("button", { name: /generate slug/i }));

    expect(output).toHaveValue("");
  });

  it("switches separator to underscore", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/slug/i);

    await user.type(input, "Hello World");

    // Click the underscore separator button
    const separatorButtons = screen.getAllByRole("button", { name: "_" });
    await user.click(separatorButtons[0]);

    expect(output).toHaveValue("hello_world");
  });

  it("shows copy button when output is present", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);

    // No copy button initially
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();

    await user.type(input, "Hello World");

    // Copy button appears after slug is generated
    expect(await screen.findByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("copies the slug to the clipboard when the copy button is clicked", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    await user.type(screen.getByLabelText(/input text/i), "Hello World");

    // Install the clipboard stub after typing: user-event's own typing
    // implementation installs its own navigator.clipboard stub on first use,
    // which would otherwise clobber one set up earlier.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    await user.click(await screen.findByRole("button", { name: /copy/i }));

    // Wait for the async clipboard write to resolve and flip the button label
    // before asserting on the mock, since the click handler is async internally.
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("hello-world");
  });

  it("handles accented characters", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/slug/i);

    await user.type(input, "Crème brûlée");

    expect(output).toHaveValue("creme-brulee");
  });
});
