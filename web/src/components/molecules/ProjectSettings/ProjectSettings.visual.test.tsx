import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import ProjectSettings from ".";

const noopAsync = async () => {};

const mockProject: Project = {
  id: "project-1",
  name: "Test Project",
  description: "A test project description",
  alias: "test-project",
  readme: "",
  license: "",
  requestRoles: ["OWNER"],
  accessibility: {
    visibility: "PUBLIC",
    publication: { publicModels: [], publicAssets: false },
    apiKeys: [],
  },
};

describe("[Visual] ProjectSettings", () => {
  test("loading state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectSettings
            hasUpdateRight={true}
            hasDeleteRight={true}
            hasPublishRight={true}
            onProjectUpdate={noopAsync}
            onProjectRequestRolesUpdate={noopAsync}
            onProjectDelete={noopAsync}
            onProjectAliasCheck={async () => true}
            onProjectVisibilityChange={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("default with full rights", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectSettings
            project={mockProject}
            hasUpdateRight={true}
            hasDeleteRight={true}
            hasPublishRight={true}
            onProjectUpdate={noopAsync}
            onProjectRequestRolesUpdate={noopAsync}
            onProjectDelete={noopAsync}
            onProjectAliasCheck={async () => true}
            onProjectVisibilityChange={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("read-only no rights", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectSettings
            project={mockProject}
            hasUpdateRight={false}
            hasDeleteRight={false}
            hasPublishRight={false}
            onProjectUpdate={noopAsync}
            onProjectRequestRolesUpdate={noopAsync}
            onProjectDelete={noopAsync}
            onProjectAliasCheck={async () => true}
            onProjectVisibilityChange={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
