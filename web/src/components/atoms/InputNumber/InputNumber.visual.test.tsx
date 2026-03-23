import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import InputNumber from ".";

describe("[Visual] InputNumber", () => {
  test("default empty", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <InputNumber placeholder="Enter number" />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("with value", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <InputNumber value={42} />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("error exceeds max", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <InputNumber value={150} max={100} />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("error below min", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <InputNumber value={-5} min={0} />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("disabled", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <InputNumber value={10} disabled />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
