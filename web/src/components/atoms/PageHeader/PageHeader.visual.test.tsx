import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import PageHeader from ".";

describe("[Visual] PageHeader", () => {
  test("PageHeader with title and subtitle", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <PageHeader title="Page Title" subTitle="Subtitle text" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("PageHeader with back button", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <PageHeader title="Details" onBack={() => {}} />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
