import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Markdown from ".";

describe("[Visual] Markdown", () => {
  test("Markdown preview mode with content", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Markdown value="# Hello World\n\nThis is **bold** and *italic* text." />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("Markdown empty state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Markdown value="" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("Markdown disabled state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Markdown value="Some content" disabled />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("Markdown error state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Markdown value="" required isError />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
