import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login screen on load", () => {
  render(<App />);

  // Adjust text to match your Login.jsx exactly
  const loginText = screen.getByText(/login/i);
  expect(loginText).toBeInTheDocument();
});