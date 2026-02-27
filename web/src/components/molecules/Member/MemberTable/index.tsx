import styled from "@emotion/styled";
import { Key, useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ListToolBarProps, TableRowSelection } from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasChangeRoleRight: boolean;
  hasInviteRight: boolean;
  hasRemoveRight: boolean;
  isAbleToLeave: boolean;
  loading: boolean;
  onLeave: (userId: string) => Promise<void>;
  onMemberAddModalOpen: () => void;
  onMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onReload: () => void;
  onRoleModalOpen: (member: UserMember) => void;
  onSearchTerm: (term?: string) => void;
  onTableChange: (page: number, pageSize: number) => void;
  page: number;
  pageSize: number;
  userId?: string;
  workspaceUserMembers?: UserMember[];
};

const MemberTable: React.FC<Props> = ({
  hasChangeRoleRight,
  hasInviteRight,
  hasRemoveRight,
  isAbleToLeave,
  loading,
  onLeave,
  onMemberAddModalOpen,
  onMemberRemoveFromWorkspace,
  onReload,
  onRoleModalOpen,
  onSearchTerm,
  onTableChange,
  page,
  pageSize,
  userId,
  workspaceUserMembers,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const [selection, setSelection] = useState<Key[]>([]);

  const handleMemberDelete = useCallback(
    (users: User[]) => {
      confirm({
        cancelText: t("No"),
        content: (
          <>
            <RemoveUsers>
              {users.map(user => (
                <RemoveUser key={user.id}>
                  <UserInfoWrapper>
                    <UserInfo>{user.name}</UserInfo>
                    <Email>{user.email}</Email>
                  </UserInfoWrapper>
                </RemoveUser>
              ))}
            </RemoveUsers>
            <div>
              {t(
                "Remove this member from workspace means this member will not view any content of this workspace.",
              )}
            </div>
          </>
        ),
        okText: t("Yes"),
        async onOk() {
          await onMemberRemoveFromWorkspace(users.map(user => user.id));
          setSelection([]);
        },
        title:
          users.length > 1
            ? t("Are you sure to remove these members?")
            : t("Are you sure to remove this member?"),
      });
    },
    [confirm, onMemberRemoveFromWorkspace, t],
  );

  const leaveConfirm = useCallback(
    (userId: string) => {
      confirm({
        content: t("Leave this workspace means you will not view any content of this workspace."),
        async onOk() {
          await onLeave(userId);
        },
        title: t("Are you sure to leave this workspace?"),
      });
    },
    [confirm, onLeave, t],
  );

  const columns = useMemo(
    () => [
      {
        dataIndex: "name",
        key: "name",
        minWidth: 256,
        title: t("Name"),
        width: 256,
      },
      {
        dataIndex: "email",
        key: "email",
        minWidth: 256,
        title: t("Email"),
        width: 256,
      },
      {
        dataIndex: "role",
        key: "role",
        minWidth: 128,
        title: t("Role"),
        width: 128,
      },
      {
        dataIndex: "action",
        key: "action",
        minWidth: 150,
        title: t("Action"),
        width: 150,
      },
    ],
    [t],
  );

  const dataSource = useMemo(
    () =>
      workspaceUserMembers?.map(member => ({
        action: (
          <>
            <ActionButton
              disabled={!hasChangeRoleRight || member.userId === userId}
              onClick={() => onRoleModalOpen(member)}
              type="link">
              {t("Change Role?")}
            </ActionButton>
            <Divider type="vertical" />
            {member.userId === userId ? (
              <ActionButton
                disabled={!isAbleToLeave}
                onClick={() => {
                  leaveConfirm(member.userId);
                }}
                type="link">
                {t("Leave")}
              </ActionButton>
            ) : (
              <ActionButton
                disabled={!hasRemoveRight}
                onClick={() => {
                  handleMemberDelete([member.user]);
                }}
                type="link">
                {t("Remove")}
              </ActionButton>
            )}
          </>
        ),
        email: member.user.email,
        id: member.userId,
        name: member.user.name,
        role: t(member.role),
      })),
    [
      workspaceUserMembers,
      t,
      hasChangeRoleRight,
      userId,
      isAbleToLeave,
      hasRemoveRight,
      onRoleModalOpen,
      leaveConfirm,
      handleMemberDelete,
    ],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          placeholder={t("input search text")}
        />
      ),
    }),
    [onSearchTerm, t],
  );

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
    }),
    [page, pageSize],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      getCheckboxProps: record => ({
        disabled: record.id === userId,
      }),
      onChange: (selectedRowKeys: Key[]) => {
        setSelection(selectedRowKeys);
      },
      selectedRowKeys: selection,
    }),
    [selection, userId],
  );

  const alertOptions = useCallback(
    (props: { selectedRows: User[] }) => (
      <Button
        danger
        disabled={!hasRemoveRight}
        icon={<Icon icon="userGroupDelete" />}
        onClick={() => handleMemberDelete(props.selectedRows)}
        size="small"
        type="link">
        {t("Remove")}
      </Button>
    ),
    [handleMemberDelete, t, hasRemoveRight],
  );

  const options = useMemo(
    () => ({
      reload: onReload,
    }),
    [onReload],
  );

  return (
    <PaddedContent>
      <PageHeader
        extra={
          <Button
            disabled={!hasInviteRight}
            icon={<Icon icon="userGroupAdd" />}
            onClick={onMemberAddModalOpen}
            type="primary">
            {t("New Member")}
          </Button>
        }
        style={{ backgroundColor: "#fff" }}
        title={t("Members")}
      />
      <TableWrapper>
        <ResizableProTable
          columns={columns}
          dataSource={dataSource}
          heightOffset={0}
          loading={loading}
          onChange={pagination => {
            onTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
          }}
          options={options}
          pagination={pagination}
          rowSelection={rowSelection}
          tableAlertOptionRender={alertOptions}
          toolbar={toolbar}
        />
      </TableWrapper>
    </PaddedContent>
  );
};

const RemoveUsers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 8px;
`;

const RemoveUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

const UserInfoWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserInfo = styled.p`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Email = styled(UserInfo)`
  color: #00000073;
`;

const PaddedContent = styled(Content)`
  padding: 16px 16px 0;
  height: 100%;
`;

const TableWrapper = styled.div`
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  height: calc(100% - 72px);
`;

const ActionButton = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`;

export default MemberTable;
