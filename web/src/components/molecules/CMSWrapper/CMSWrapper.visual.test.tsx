import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import CMSWrapper from ".";

const noop = () => {};

const headerPlaceholder = (
  <div
    style={{
      height: 48,
      background: "#001529",
      color: "white",
      lineHeight: "48px",
      padding: "0 16px",
    }}>
    Header
  </div>
);

const sidebarPlaceholder = <div style={{ padding: 16 }}>Sidebar Menu</div>;

const contentPlaceholder = <div style={{ padding: 24 }}>Page Content</div>;

describe("[Visual] CMSWrapper", () => {
  test("expanded sidebar", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root} style={{ height: 600 }}>
          <CMSWrapper
            headerComponent={headerPlaceholder}
            sidebarComponent={sidebarPlaceholder}
            contentComponent={contentPlaceholder}
            collapsedMainMenu={false}
            onCollapse={noop}
            shouldPreventReload={false}
            isShowUploader={false}
            uploaderState={{ isOpen: false, showBadge: false, queue: [] }}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("collapsed sidebar", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root} style={{ height: 600 }}>
          <CMSWrapper
            headerComponent={headerPlaceholder}
            sidebarComponent={sidebarPlaceholder}
            contentComponent={contentPlaceholder}
            collapsedMainMenu={true}
            onCollapse={noop}
            shouldPreventReload={false}
            isShowUploader={false}
            uploaderState={{ isOpen: false, showBadge: false, queue: [] }}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
