import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import License from ".";

const noop = () => {};
const noopAsync = async () => {};

describe("[Visual] License", () => {
  test("License view mode", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <License
            licenseValue=""
            projectLicense="# MIT License\n\nPermission is hereby granted..."
            licenseEditMode={false}
            hasUpdateRight
            onProjectUpdate={noopAsync}
            onLicenseSave={noopAsync}
            onLicenseEdit={noop}
            onLicenseMarkdownChange={noop}
            onChooseLicenseTemplate={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("License edit mode", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <License
            licenseValue="# MIT License"
            projectLicense=""
            licenseEditMode
            hasUpdateRight
            onProjectUpdate={noopAsync}
            onLicenseSave={noopAsync}
            onLicenseEdit={noop}
            onLicenseMarkdownChange={noop}
            onChooseLicenseTemplate={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
