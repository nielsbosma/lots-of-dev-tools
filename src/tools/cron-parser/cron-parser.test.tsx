import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CronParser from "./cron-parser";

describe("CronParser component", () => {
  it("renders input field and parse button", () => {
    render(<CronParser />);
    expect(screen.getByLabelText("Cron Expression")).toBeInTheDocument();
    expect(screen.getByLabelText("Next N runs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Parse" })).toBeInTheDocument();
  });

  it("shows description and next runs after parsing a valid expression", async () => {
    const user = userEvent.setup();
    render(<CronParser />);

    await user.type(screen.getByLabelText("Cron Expression"), "*/15 * * * *");
    await user.click(screen.getByRole("button", { name: "Parse" }));

    expect(screen.getByText(/Every 15 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/NEXT \d+ RUNS?/i)).toBeInTheDocument();
  });

  it("shows error for invalid expression", async () => {
    const user = userEvent.setup();
    render(<CronParser />);

    await user.type(screen.getByLabelText("Cron Expression"), "invalid");
    await user.click(screen.getByRole("button", { name: "Parse" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/expected 5 fields/i);
  });

  it("shows error for empty expression", async () => {
    const user = userEvent.setup();
    render(<CronParser />);

    await user.click(screen.getByRole("button", { name: "Parse" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a cron expression"
    );
  });

  it("respects the next N count setting", async () => {
    const user = userEvent.setup();
    render(<CronParser />);

    const expressionInput = screen.getByLabelText("Cron Expression");
    await user.type(expressionInput, "* * * * *");

    const countInput = screen.getByLabelText("Next N runs") as HTMLInputElement;
    await user.tripleClick(countInput);
    await user.keyboard("3");

    await user.click(screen.getByRole("button", { name: "Parse" }));

    const results = screen.getAllByText(/\d+\./);
    expect(results).toHaveLength(3);
  });

  it("parses on Enter key press", async () => {
    const user = userEvent.setup();
    render(<CronParser />);

    const input = screen.getByLabelText("Cron Expression");
    await user.type(input, "0 9 * * *{Enter}");

    expect(screen.getByText(/At minute 0/i)).toBeInTheDocument();
  });
});
