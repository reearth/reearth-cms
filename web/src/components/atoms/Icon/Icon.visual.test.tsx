import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot } from "@reearth-cms/test/vrt-utils";

import Icon from ".";

describe("[Visual] Icon", () => {
  test("Icon named icon", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <Icon icon="user" size={32} />
      </div>,
    );
    await expectScreenshot();
  });

  test("Icon with color", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <Icon icon="download" size={32} color="#1890ff" />
      </div>,
    );
    await expectScreenshot();
  });

  test("Icon different sizes", async () => {
    await render(
      <div data-testid={DATA_TEST_ID.VRT__Root}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Icon icon="user" size={16} />
          <Icon icon="user" size={24} />
          <Icon icon="user" size={32} />
          <Icon icon="user" size={48} />
        </div>
      </div>,
    );
    await expectScreenshot();
  });
});
