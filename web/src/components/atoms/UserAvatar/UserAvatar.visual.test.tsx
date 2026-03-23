import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot } from "@reearth-cms/test/vrt-utils";

import UserAvatar from ".";

describe("[Visual] UserAvatar", () => {
  test("UserAvatar named user", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="John" />
      </div>,
    );
    await expectScreenshot();
  });

  test("UserAvatar anonymous user", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="Anonymous" />
      </div>,
    );
    await expectScreenshot();
  });

  test("UserAvatar with shadow", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <UserAvatar username="Alice" shadow />
      </div>,
    );
    await expectScreenshot();
  });
});
