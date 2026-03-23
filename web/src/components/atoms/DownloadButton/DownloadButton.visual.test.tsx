import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import DownloadButton from ".";

describe("[Visual] DownloadButton", () => {
  test("DownloadButton default with icon", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <DownloadButton displayDefaultIcon />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("DownloadButton custom title", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <DownloadButton title="Export CSV" displayDefaultIcon />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("DownloadButton icon only mode", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <DownloadButton onlyIcon />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("DownloadButton disabled", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <DownloadButton displayDefaultIcon disabled />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
