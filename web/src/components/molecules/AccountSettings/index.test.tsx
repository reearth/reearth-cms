import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

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
        me={undefined}
        loading={true}
        onUserUpdate={onUserUpdate}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
    expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
  });

  test("Title displays successfully", () => {
    const me = {
      id: "id",
      name: "name",
      email: "email",
      lang: "lang",
    };

    render(
      <AccountSettings
        me={me}
        loading={false}
        onUserUpdate={onUserUpdate}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
      />,
    );
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByText("Account Settings")).toBeVisible();
  });
});
