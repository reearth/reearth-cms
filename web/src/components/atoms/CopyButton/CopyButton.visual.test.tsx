import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import CopyButton from ".";

describe("[Visual] CopyButton", () => {
  test("CopyButton default", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <CopyButton copyable={{ text: "sample text" }} />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
