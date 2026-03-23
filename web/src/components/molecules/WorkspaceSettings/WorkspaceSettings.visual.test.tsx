import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import WorkspaceSettings from ".";

const noopAsync = async () => {};

describe("[Visual] WorkspaceSettings", () => {
  test("default with rights", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <WorkspaceSettings
            workspaceName="My Workspace"
            updateWorkspaceLoading={false}
            hasUpdateRight={true}
            hasDeleteRight={true}
            onWorkspaceUpdate={noopAsync}
            onWorkspaceDelete={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("no rights", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <WorkspaceSettings
            workspaceName="My Workspace"
            updateWorkspaceLoading={false}
            hasUpdateRight={false}
            hasDeleteRight={false}
            onWorkspaceUpdate={noopAsync}
            onWorkspaceDelete={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("loading state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <WorkspaceSettings
            workspaceName="My Workspace"
            updateWorkspaceLoading={true}
            hasUpdateRight={true}
            hasDeleteRight={true}
            onWorkspaceUpdate={noopAsync}
            onWorkspaceDelete={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
