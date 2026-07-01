import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlugGenerator from "./slug-generator";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

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

  it("copy button calls clipboard API", async () => {
    const user = userEvent.setup();
    render(<SlugGenerator />);

    const input = screen.getByLabelText(/input text/i);

    await user.type(input, "Hello World");

    const copyButton = screen.getByRole("button", { name: /copy/i });
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello-world");
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();
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
