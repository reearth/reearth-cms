import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Input from ".";

describe("[Visual] Input", () => {
  test("default empty", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input placeholder="Enter text" />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("with value", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input value="Hello World" />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("error via isError", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input value="test" isError />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("error via maxLength exceeded", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input value="abcdef" maxLength={3} />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("required empty", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input value="" required />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("disabled", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Input value="Disabled text" disabled />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
