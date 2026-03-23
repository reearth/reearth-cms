import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import BasicInnerContents from "./basic";
import ComplexInnerContents from "./complex";

describe("[Visual] InnerContents", () => {
  test("BasicInnerContents with title and content", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <BasicInnerContents title="Section Title" subtitle="Description">
            <div style={{ padding: 16, background: "#fafafa" }}>Content area</div>
          </BasicInnerContents>
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("BasicInnerContents with back button and extra", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <BasicInnerContents title="Details" onBack={() => {}} extra={<button>Action</button>}>
            <div style={{ padding: 16 }}>Main content</div>
            <div style={{ padding: 16 }}>Secondary content</div>
          </BasicInnerContents>
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("ComplexInnerContents three panel layout", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root} style={{ height: 400 }}>
          <ComplexInnerContents
            left={<div style={{ width: 100, background: "#f0f0f0", padding: 8 }}>Left</div>}
            center={<div style={{ background: "#fafafa", padding: 8 }}>Center</div>}
            right={<div style={{ width: 200, background: "#f0f0f0", padding: 8 }}>Right</div>}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
