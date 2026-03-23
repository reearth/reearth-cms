import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Status from ".";

describe("[Visual] Status", () => {
  test("Status DRAFT", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Status status="DRAFT" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("Status PUBLIC", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Status status="PUBLIC" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("Status REVIEW", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Status status="REVIEW" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
