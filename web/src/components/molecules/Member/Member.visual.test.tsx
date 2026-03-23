import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Member from ".";

const noop = () => {};
const noopAsync = async () => {};

const mockMembers: UserMember[] = [
  {
    userId: "user-1",
    role: "OWNER",
    user: { id: "user-1", name: "Alice Owner", email: "alice@example.com" },
  },
  {
    userId: "user-2",
    role: "WRITER",
    user: { id: "user-2", name: "Bob Writer", email: "bob@example.com" },
  },
  {
    userId: "user-3",
    role: "READER",
    user: { id: "user-3", name: "Charlie Reader", email: "charlie@example.com" },
  },
];

describe("[Visual] Member", () => {
  test("empty table", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Member
            workspaceUserMembers={[]}
            userId="user-1"
            isAbleToLeave={false}
            onMemberRemoveFromWorkspace={noopAsync}
            onLeave={noopAsync}
            onSearchTerm={noop}
            page={1}
            pageSize={10}
            onTableChange={noop}
            loading={false}
            onReload={noop}
            hasInviteRight={true}
            hasRemoveRight={true}
            hasChangeRoleRight={true}
            updateLoading={false}
            onUpdateRole={noopAsync}
            searchLoading={false}
            addLoading={false}
            onUserSearch={async () => []}
            onUsersAddToWorkspace={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("with members", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Member
            workspaceUserMembers={mockMembers}
            userId="user-1"
            isAbleToLeave={true}
            onMemberRemoveFromWorkspace={noopAsync}
            onLeave={noopAsync}
            onSearchTerm={noop}
            page={1}
            pageSize={10}
            onTableChange={noop}
            loading={false}
            onReload={noop}
            hasInviteRight={true}
            hasRemoveRight={true}
            hasChangeRoleRight={true}
            updateLoading={false}
            onUpdateRole={noopAsync}
            searchLoading={false}
            addLoading={false}
            onUserSearch={async () => []}
            onUsersAddToWorkspace={noopAsync}
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
          <Member
            workspaceUserMembers={mockMembers}
            userId="user-1"
            isAbleToLeave={false}
            onMemberRemoveFromWorkspace={noopAsync}
            onLeave={noopAsync}
            onSearchTerm={noop}
            page={1}
            pageSize={10}
            onTableChange={noop}
            loading={false}
            onReload={noop}
            hasInviteRight={false}
            hasRemoveRight={false}
            hasChangeRoleRight={false}
            updateLoading={false}
            onUpdateRole={noopAsync}
            searchLoading={false}
            addLoading={false}
            onUserSearch={async () => []}
            onUsersAddToWorkspace={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
