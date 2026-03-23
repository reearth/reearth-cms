import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import TextArea from ".";

describe("[Visual] TextArea", () => {
  test("default empty", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <TextArea placeholder="Enter text" />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("with multiline value", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <TextArea value={"Line 1\nLine 2\nLine 3"} />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("error via isError", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <TextArea value="test" isError />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("error via maxLength exceeded", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <TextArea value="abcdefgh" maxLength={5} />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("disabled", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <TextArea value="Some content" disabled />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
