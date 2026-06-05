import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HtmlEncoder from "./html-encoder";

describe("HtmlEncoder component", () => {
  it("renders input and output textareas", () => {
    render(<HtmlEncoder />);
    expect(screen.getByLabelText("Input")).toBeInTheDocument();
    expect(screen.getByLabelText("Output")).toBeInTheDocument();
  });

  it("encodes text when Encode is clicked", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);

    await user.type(screen.getByLabelText("Input"), "<div>");
    await user.click(screen.getByRole("button", { name: "Encode" }));

    expect(screen.getByLabelText("Output")).toHaveValue("&lt;div&gt;");
  });

  it("decodes text when Decode is clicked", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);

    await user.type(screen.getByLabelText("Input"), "&lt;div&gt;");
    await user.click(screen.getByRole("button", { name: "Decode" }));

    expect(screen.getByLabelText("Output")).toHaveValue("<div>");
  });

  it("encodes quotes and ampersands", async () => {
    const user = userEvent.setup();
    render(<HtmlEncoder />);

    await user.type(screen.getByLabelText("Input"), '"test" & \'value\'');
    await user.click(screen.getByRole("button", { name: "Encode" }));

    expect(screen.getByLabelText("Output")).toHaveValue(
      "&quot;test&quot; &amp; &#39;value&#39;",
    );
  });
});
