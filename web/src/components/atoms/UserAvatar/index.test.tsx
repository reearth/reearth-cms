import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import UserAvatar from ".";

test("renders the profile picture when profilePictureUrl is provided", () => {
  const profilePictureUrl = "https://example.com/avatar.png";

  render(<UserAvatar username="Anonymous" shadow profilePictureUrl={profilePictureUrl} />);

  expect(screen.getByRole("img")).toHaveAttribute("src", profilePictureUrl);
});

test("renders the username initial without shadow styling", () => {
  render(<UserAvatar username="Bob" />);

  expect(screen.getByText("B")).toBeInTheDocument();
});
