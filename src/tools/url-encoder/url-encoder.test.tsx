import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UrlEncoder from "./url-encoder";

describe("UrlEncoder component", () => {
  it("renders input and output textareas", () => {
    render(<UrlEncoder />);
    expect(screen.getByLabelText("Input")).toBeInTheDocument();
    expect(screen.getByLabelText("Output")).toBeInTheDocument();
  });

  it("encodes text when Encode is clicked", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    await user.type(screen.getByLabelText("Input"), "hello world");
    await user.click(screen.getByRole("button", { name: "Encode" }));

    expect(screen.getByLabelText("Output")).toHaveValue("hello%20world");
  });

  it("decodes text when Decode is clicked", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    await user.type(screen.getByLabelText("Input"), "hello%20world");
    await user.click(screen.getByRole("button", { name: "Decode" }));

    expect(screen.getByLabelText("Output")).toHaveValue("hello world");
  });

  it("shows error for invalid decode input", async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);

    await user.type(screen.getByLabelText("Input"), "%E0%A4%A");
    await user.click(screen.getByRole("button", { name: "Decode" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid encoded string",
    );
  });
});
