import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import WarningText from ".";

describe("[Visual] WarningText", () => {
  test("WarningText default", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <WarningText text="This action cannot be undone." />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
