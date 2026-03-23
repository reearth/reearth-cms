import { describe, test } from "vitest";
import { render } from "vitest-browser-react";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Workspace from ".";

const noop = () => {};
const noopAsync = async () => {};

const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Project Alpha",
    description: "First test project",
    alias: "project-alpha",
    readme: "",
    license: "",
    requestRoles: ["OWNER"],
  },
  {
    id: "p2",
    name: "Project Beta",
    description: "Second test project with a longer description for layout testing",
    alias: "project-beta",
    readme: "",
    license: "",
    requestRoles: ["OWNER"],
  },
];

describe("[Visual] Workspace", () => {
  test("empty projects", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Workspace
            username="John"
            projects={[]}
            loading={false}
            hasCreateRight={true}
            page={1}
            pageSize={10}
            projectSort="updatedat"
            totalCount={0}
            onProjectSearch={noop}
            onProjectSort={noop}
            onProjectNavigation={noop}
            onProjectCreate={noopAsync}
            onWorkspaceCreate={noopAsync}
            onProjectAliasCheck={async () => true}
            onPageChange={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("with projects", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Workspace
            username="John"
            projects={mockProjects}
            loading={false}
            hasCreateRight={true}
            page={1}
            pageSize={10}
            projectSort="updatedat"
            totalCount={2}
            onProjectSearch={noop}
            onProjectSort={noop}
            onProjectNavigation={noop}
            onProjectCreate={noopAsync}
            onWorkspaceCreate={noopAsync}
            onProjectAliasCheck={async () => true}
            onPageChange={noop}
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
          <Workspace
            username="John"
            projects={[]}
            loading={true}
            hasCreateRight={true}
            page={1}
            pageSize={10}
            projectSort="updatedat"
            totalCount={0}
            onProjectSearch={noop}
            onProjectSort={noop}
            onProjectNavigation={noop}
            onProjectCreate={noopAsync}
            onWorkspaceCreate={noopAsync}
            onProjectAliasCheck={async () => true}
            onPageChange={noop}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
