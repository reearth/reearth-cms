import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import NotFound from ".";

describe("[Visual] NotFound", () => {
  test("NotFound default", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <NotFound />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
