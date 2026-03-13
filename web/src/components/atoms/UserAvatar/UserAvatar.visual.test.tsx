import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import UserAvatar from ".";

describe("[Visual] UserAvatar", () => {
  test("UserAvatar named user", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="John" />
      </div>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("UserAvatar anonymous user", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="Anonymous" />
      </div>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("UserAvatar with shadow", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="Alice" shadow />
      </div>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
