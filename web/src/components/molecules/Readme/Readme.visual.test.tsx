import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Readme from ".";

const noop = () => {};
const noopAsync = async () => {};

describe("[Visual] Readme", () => {
  test("Readme view mode", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Readme
            readmeValue=""
            projectReadme="# Project Title\n\nA brief description of the project."
            readmeEditMode={false}
            hasUpdateRight
            onProjectUpdate={noopAsync}
            onReadmeSave={noopAsync}
            onReadmeEdit={noop}
            onReadmeMarkdownChange={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("Readme edit mode", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Readme
            readmeValue="# Project Title"
            projectReadme=""
            readmeEditMode
            hasUpdateRight
            onProjectUpdate={noopAsync}
            onReadmeSave={noopAsync}
            onReadmeEdit={noop}
            onReadmeMarkdownChange={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
