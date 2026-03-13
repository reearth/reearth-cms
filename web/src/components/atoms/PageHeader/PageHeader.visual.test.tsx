import { expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import PageHeader from ".";

test("PageHeader with title and subtitle", async () => {
  await render(
    <VRTWrapper>
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <PageHeader title="Page Title" subTitle="Subtitle text" />
      </div>
    </VRTWrapper>,
  );
  await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
});

test("PageHeader with back button", async () => {
  await render(
    <VRTWrapper>
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <PageHeader title="Details" onBack={() => {}} />
      </div>
    </VRTWrapper>,
  );
  await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
});
