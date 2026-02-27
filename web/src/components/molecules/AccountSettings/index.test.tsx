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

  const me = {
    id: "id",
    name: "name",
    email: "email",
    lang: "en",
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

  test("Loading when me is provided but loading is true", () => {
    render(
      <AccountSettings
        me={me}
        loading={true}
        onUserUpdate={onUserUpdate}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
    expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
  });

  test("Loading when me is undefined and loading is false", () => {
    render(
      <AccountSettings
        me={undefined}
        loading={false}
        onUserUpdate={onUserUpdate}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
    expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
  });

  test("Section headings are rendered", () => {
    render(
      <AccountSettings
        me={me}
        loading={false}
        onUserUpdate={onUserUpdate}
        onLanguageUpdate={onLanguageUpdate}
        onUserDelete={onUserDelete}
      />,
    );

    expect(screen.getByText("General")).toBeVisible();
    expect(screen.getByText("Service")).toBeVisible();
    expect(screen.getByText("Danger Zone")).toBeVisible();
  });
});
