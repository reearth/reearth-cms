import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AccountSettings from ".";

describe("Account settings", () => {
  const onUserUpdate = () => {
    return Promise.resolve();
  };
  const onLanguageUpdate = () => {
    return Promise.resolve();
  };
  const onUserDelete = () => {
    return Promise.resolve();
  };

  test("Loading displays successfully", () => {
    render(
      <AccountSettings
        loading={true}
        me={undefined}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
        onUserUpdate={onUserUpdate}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
    expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
  });

  test("Title displays successfully", () => {
    const me = {
      email: "email",
      id: "id",
      lang: "lang",
      name: "name",
    };

    render(
      <AccountSettings
        loading={false}
        me={me}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
        onUserUpdate={onUserUpdate}
      />,
    );
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByText("Account Settings")).toBeVisible();
  });
});
