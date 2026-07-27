import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type AuthHook from "./AuthHook";
import { AuthContext } from "./AuthProvider";

import { AuthenticationRequiredPage } from ".";

const renderWithAuth = (auth: AuthHook) =>
  render(
    <AuthContext.Provider value={auth}>
      <AuthenticationRequiredPage>
        <div>secret</div>
      </AuthenticationRequiredPage>
    </AuthContext.Provider>,
  );

const baseAuth: AuthHook = {
  user: undefined,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  getAccessToken: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
};

test("renders children when authenticated", () => {
  renderWithAuth(baseAuth);
  expect(screen.getByText("secret")).toBeInTheDocument();
});

test("renders nothing when not authenticated", () => {
  const { container } = renderWithAuth({ ...baseAuth, isAuthenticated: false });
  expect(container).toBeEmptyDOMElement();
});
