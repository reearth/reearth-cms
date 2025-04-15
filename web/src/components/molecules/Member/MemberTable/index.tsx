import styled from "@emotion/styled";
import { Key, useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ListToolBarProps, TableRowSelection } from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

const { confirm } = Modal;

type Props = {
  workspaceUserMembers?: UserMember[];
  userId?: string;
  isAbleToLeave: boolean;
  onMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onLeave: (userId: string) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  onRoleModalOpen: (member: UserMember) => void;
  onMemberAddModalOpen: () => void;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  loading: boolean;
  onReload: () => void;
  hasInviteRight: boolean;
  hasRemoveRight: boolean;
  hasChangeRoleRight: boolean;
};

const MemberTable: React.FC<Props> = ({
  workspaceUserMembers,
  userId,
  isAbleToLeave,
  onMemberRemoveFromWorkspace,
  onLeave,
  onSearchTerm,
  onRoleModalOpen,
  onMemberAddModalOpen,
  page,
  pageSize,
  onTableChange,
  loading,
  onReload,
  hasInviteRight,
  hasRemoveRight,
  hasChangeRoleRight,
}) => {
  const t = useT();
  const [selection, setSelection] = useState<Key[]>([]);

  const handleMemberDelete = useCallback(
    (users: User[]) => {
      confirm({
        title:
          users.length > 1
            ? t("Are you sure to remove these members?")
            : t("Are you sure to remove this member?"),
        icon: <Icon icon="exclamationCircle" />,
        content: (
          <>
            <RemoveUsers>
              {users.map(user => (
                <RemoveUser key={user.id}>
                  <UserAvatar username={user.name} />
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
        cancelText: t("No"),
        async onOk() {
          await onMemberRemoveFromWorkspace(users.map(user => user.id));
          setSelection([]);
        },
      });
    },
    [onMemberRemoveFromWorkspace, t],
  );

  const leaveConfirm = useCallback(
    (userId: string) => {
      confirm({
        title: t("Are you sure to leave this workspace?"),
        icon: <Icon icon="exclamationCircle" />,
        content: t("Leave this workspace means you will not view any content of this workspace."),
        async onOk() {
          await onLeave(userId);
        },
      });
    },
    [onLeave, t],
  );

  const columns = useMemo(
    () => [
      {
        title: t("Name"),
        dataIndex: "name",
        key: "name",
        width: 256,
        minWidth: 256,
      },
      {
        title: t("Thumbnail"),
        dataIndex: "thumbnail",
        key: "thumbnail",
        width: 128,
        minWidth: 128,
      },
      {
        title: t("Email"),
        dataIndex: "email",
        key: "email",
        width: 256,
        minWidth: 256,
      },
      {
        title: t("Role"),
        dataIndex: "role",
        key: "role",
        width: 128,
        minWidth: 128,
      },
      {
        title: t("Action"),
        dataIndex: "action",
        key: "action",
        width: 150,
        minWidth: 150,
      },
    ],
    [t],
  );

  const dataSource = useMemo(
    () =>
      workspaceUserMembers?.map(member => ({
        id: member.userId,
        name: member.user.name,
        thumbnail: <UserAvatar username={member.user.name} />,
        email: member.user.email,
        role: t(member.role),
        action: (
          <>
            <ActionButton
              type="link"
              onClick={() => onRoleModalOpen(member)}
              disabled={!hasChangeRoleRight || member.userId === userId}>
              {t("Change Role?")}
            </ActionButton>
            <Divider type="vertical" />
            {member.userId === userId ? (
              <ActionButton
                type="link"
                onClick={() => {
                  leaveConfirm(member.userId);
                }}
                disabled={!isAbleToLeave}>
                {t("Leave")}
              </ActionButton>
            ) : (
              <ActionButton
                type="link"
                onClick={() => {
                  handleMemberDelete([member.user]);
                }}
                disabled={!hasRemoveRight}>
                {t("Remove")}
              </ActionButton>
            )}
          </>
        ),
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
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
        />
      ),
    }),
    [onSearchTerm, t],
  );

  const pagination = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      pageSize: pageSize,
    }),
    [page, pageSize],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selection,
      onChange: (selectedRowKeys: Key[]) => {
        setSelection(selectedRowKeys);
      },
      getCheckboxProps: record => ({
        disabled: record.id === userId,
      }),
    }),
    [selection, userId],
  );

  const alertOptions = useCallback(
    (props: { selectedRows: User[] }) => (
      <Button
        type="link"
        size="small"
        icon={<Icon icon="userGroupDelete" />}
        onClick={() => handleMemberDelete(props.selectedRows)}
        danger
        disabled={!hasRemoveRight}>
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
        title={t("Members")}
        style={{ backgroundColor: "#fff" }}
        extra={
          <Button
            type="primary"
            onClick={onMemberAddModalOpen}
            icon={<Icon icon="userGroupAdd" />}
            disabled={!hasInviteRight}>
            {t("New Member")}
          </Button>
        }
      />
      <TableWrapper>
        <ResizableProTable
          dataSource={dataSource}
          columns={columns}
          tableAlertOptionRender={alertOptions}
          pagination={pagination}
          toolbar={toolbar}
          options={options}
          rowSelection={rowSelection}
          loading={loading}
          heightOffset={0}
          onChange={pagination => {
            onTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
          }}
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
