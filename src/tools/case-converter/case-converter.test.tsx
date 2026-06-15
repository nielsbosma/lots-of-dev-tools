import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaseConverter from "./case-converter";

describe("CaseConverter", () => {
  it("renders input and output textareas", () => {
    render(<CaseConverter />);
    expect(screen.getByLabelText(/input text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/output/i)).toBeInTheDocument();
  });

  it("converts to camelCase when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "hello_world");
    await user.click(screen.getByRole("button", { name: /camelCase/i }));

    expect(output).toHaveValue("helloWorld");
  });

  it("converts to snake_case when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "helloWorld");
    await user.click(screen.getByRole("button", { name: /snake_case/i }));

    expect(output).toHaveValue("hello_world");
  });

  it("converts to kebab-case when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "helloWorld");
    await user.click(screen.getByRole("button", { name: /kebab-case/i }));

    expect(output).toHaveValue("hello-world");
  });

  it("converts to PascalCase when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "hello_world");
    await user.click(screen.getByRole("button", { name: /PascalCase/i }));

    expect(output).toHaveValue("HelloWorld");
  });

  it("converts to CONSTANT_CASE when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "helloWorld");
    await user.click(screen.getByRole("button", { name: /CONSTANT_CASE/i }));

    expect(output).toHaveValue("HELLO_WORLD");
  });

  it("converts to Title Case when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);
    const output = screen.getByLabelText(/output/i);

    await user.type(input, "helloWorld");
    await user.click(screen.getByRole("button", { name: /Title Case/i }));

    expect(output).toHaveValue("Hello World");
  });

  it("shows detected case", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const input = screen.getByLabelText(/input text/i);

    await user.type(input, "helloWorld");

    expect(screen.getByText(/Detected: camelCase/i)).toBeInTheDocument();
  });

  it("handles empty input gracefully", async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);

    const output = screen.getByLabelText(/output/i);

    await user.click(screen.getByRole("button", { name: /camelCase/i }));

    expect(output).toHaveValue("");
  });
});
