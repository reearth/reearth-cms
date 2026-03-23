import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import ProTable from ".";

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Age", dataIndex: "age", key: "age" },
  { title: "Email", dataIndex: "email", key: "email" },
];

describe("[Visual] ProTable", () => {
  test("empty table", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProTable
            columns={columns}
            dataSource={[]}
            search={false}
            options={false}
            loading={false}
            pagination={false}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("table with data", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProTable
            columns={columns}
            dataSource={[
              { key: "1", name: "Alice", age: 30, email: "alice@example.com" },
              { key: "2", name: "Bob", age: 25, email: "bob@example.com" },
              { key: "3", name: "Charlie", age: 35, email: "charlie@example.com" },
            ]}
            search={false}
            options={false}
            loading={false}
            pagination={false}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
