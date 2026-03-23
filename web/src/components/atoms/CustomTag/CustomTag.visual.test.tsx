import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot } from "@reearth-cms/test/vrt-utils";

import CustomTag from ".";

describe("[Visual] CustomTag", () => {
  test("CustomTag default", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <CustomTag value={42} />
      </div>,
    );
    await expectScreenshot();
  });

  test("CustomTag custom color", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <CustomTag value="A" color="#1890ff" />
      </div>,
    );
    await expectScreenshot();
  });

  test("CustomTag string value", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <CustomTag value="Tag" color="#52c41a" />
      </div>,
    );
    await expectScreenshot();
  });
});
