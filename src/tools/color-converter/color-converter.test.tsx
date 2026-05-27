import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ColorConverter from "./color-converter";

describe("ColorConverter component", () => {
  it("renders all three input fields", () => {
    render(<ColorConverter />);
    expect(screen.getByLabelText("HEX")).toBeInTheDocument();
    expect(screen.getByLabelText("RGB")).toBeInTheDocument();
    expect(screen.getByLabelText("HSL")).toBeInTheDocument();
  });

  it("converts from hex to rgb and hsl", async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const hexInput = screen.getByLabelText("HEX");
    await user.clear(hexInput);
    await user.type(hexInput, "#ff0000");
    await user.click(screen.getAllByRole("button", { name: "Convert" })[0]);

    expect(screen.getByLabelText("RGB")).toHaveValue("rgb(255, 0, 0)");
    expect(screen.getByLabelText("HSL")).toHaveValue("hsl(0, 100%, 50%)");
  });

  it("converts from rgb to hex and hsl", async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const rgbInput = screen.getByLabelText("RGB");
    await user.clear(rgbInput);
    await user.type(rgbInput, "rgb(0, 255, 0)");
    await user.click(screen.getAllByRole("button", { name: "Convert" })[1]);

    expect(screen.getByLabelText("HEX")).toHaveValue("#00ff00");
    expect(screen.getByLabelText("HSL")).toHaveValue("hsl(120, 100%, 50%)");
  });

  it("shows error for invalid hex", async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const hexInput = screen.getByLabelText("HEX");
    await user.clear(hexInput);
    await user.type(hexInput, "not-a-color");
    await user.click(screen.getAllByRole("button", { name: "Convert" })[0]);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid hex color");
  });

  it("shows color preview", () => {
    render(<ColorConverter />);
    const preview = screen.getByTestId("color-preview");
    expect(preview).toHaveStyle({ backgroundColor: "#ff8800" });
  });
});
