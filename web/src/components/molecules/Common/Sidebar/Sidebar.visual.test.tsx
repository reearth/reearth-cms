import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Sidebar from ".";

describe("[Visual] Sidebar", () => {
  test("Sidebar expanded", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root} style={{ height: 300 }}>
          <Sidebar collapsed={false}>
            <div style={{ padding: 16 }}>Sidebar Content</div>
          </Sidebar>
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("Sidebar collapsed", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root} style={{ height: 300 }}>
          <Sidebar collapsed>
            <div style={{ padding: 16 }}>Sidebar Content</div>
          </Sidebar>
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
