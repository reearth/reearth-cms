import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Integration from ".";

const noop = () => {};
const noopAsync = async () => {};

const mockIntegrations: WorkspaceIntegration[] = [
  {
    id: "int-1",
    name: "GitHub Integration",
    description: "Connects to GitHub",
    role: "WRITER",
  },
  {
    id: "int-2",
    name: "Slack Integration",
    description: "Sends notifications to Slack",
    role: "READER",
  },
];

describe("[Visual] Integration", () => {
  test("empty table", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Integration
            loading={false}
            workspaceIntegrations={[]}
            onSearchTerm={noop}
            setSelectedIntegration={noop}
            onIntegrationRemove={noopAsync}
            deleteLoading={false}
            page={1}
            pageSize={10}
            onTableChange={noop}
            hasConnectRight={true}
            hasUpdateRight={true}
            hasDeleteRight={true}
            addLoading={false}
            onIntegrationConnect={noopAsync}
            updateLoading={false}
            onUpdateIntegration={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("with integrations", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Integration
            loading={false}
            workspaceIntegrations={mockIntegrations}
            onSearchTerm={noop}
            setSelectedIntegration={noop}
            onIntegrationRemove={noopAsync}
            deleteLoading={false}
            page={1}
            pageSize={10}
            onTableChange={noop}
            hasConnectRight={true}
            hasUpdateRight={true}
            hasDeleteRight={true}
            addLoading={false}
            onIntegrationConnect={noopAsync}
            updateLoading={false}
            onUpdateIntegration={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("no rights", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Integration
            loading={false}
            workspaceIntegrations={mockIntegrations}
            onSearchTerm={noop}
            setSelectedIntegration={noop}
            onIntegrationRemove={noopAsync}
            deleteLoading={false}
            page={1}
            pageSize={10}
            onTableChange={noop}
            hasConnectRight={false}
            hasUpdateRight={false}
            hasDeleteRight={false}
            addLoading={false}
            onIntegrationConnect={noopAsync}
            updateLoading={false}
            onUpdateIntegration={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
