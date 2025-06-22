import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders IdeaHub heading", async () => {
  // Render your App (this kicks off the fetch/useEffect)
  render(<App />);

  // findByText will wait for the element to appear,
  // and under the hood it'll wrap updates in act().
  const heading = await screen.findByText(/IdeaHub/i);

  expect(heading).toBeInTheDocument();
});
