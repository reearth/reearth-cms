import styled from "@emotion/styled";
import { Key, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ListToolBarProps, TableRowSelection } from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

const { confirm } = Modal;

type Props = {
  me: {
    id?: string;
    myWorkspace?: string;
  };
  isOwner: boolean;
  isAbleToLeave: boolean;
  handleMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onLeave: (userId: string) => Promise<void>;
  handleSearchTerm: (term?: string) => void;
  handleRoleModalOpen: (member: UserMember) => void;
  handleMemberAddModalOpen: () => void;
  workspaceUserMembers?: UserMember[];
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  loading: boolean;
  onReload: () => void;
};

const MemberTable: React.FC<Props> = ({
  me,
  isOwner,
  isAbleToLeave,
  handleMemberRemoveFromWorkspace,
  onLeave,
  handleSearchTerm,
  handleRoleModalOpen,
  handleMemberAddModalOpen,
  workspaceUserMembers,
  selection,
  setSelection,
  page,
  pageSize,
  onTableChange,
  loading,
  onReload,
}) => {
  const t = useT();

  const handleMemberDelete = useCallback(
    (userIds: string[]) => {
      confirm({
        title: t("Are you sure to remove this member?"),
        icon: <Icon icon="exclamationCircle" />,
        content: t(
          "Remove this member from workspace means this member will not view any content of this workspace.",
        ),
        async onOk() {
          await handleMemberRemoveFromWorkspace(userIds);
        },
      });
    },
    [handleMemberRemoveFromWorkspace, t],
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
        width: 128,
        minWidth: 128,
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
              onClick={() => handleRoleModalOpen(member)}
              disabled={!isOwner || member.userId === me.id}>
              {t("Change Role?")}
            </ActionButton>
            {member.userId === me.id && (
              <>
                <Divider type="vertical" />
                <ActionButton
                  type="link"
                  onClick={() => {
                    leaveConfirm(member.userId);
                  }}
                  disabled={!isAbleToLeave}>
                  {t("Leave")}
                </ActionButton>
              </>
            )}
          </>
        ),
      })),
    [workspaceUserMembers, t, isOwner, me.id, isAbleToLeave, handleRoleModalOpen, leaveConfirm],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            handleSearchTerm(value);
          }}
        />
      ),
    }),
    [handleSearchTerm, t],
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
      selectedRowKeys: selection.selectedRowKeys,
      onChange: (selectedRowKeys: Key[]) => {
        setSelection({
          ...selection,
          selectedRowKeys: selectedRowKeys,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.id === me.id,
      }),
    }),
    [me.id, selection, setSelection],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => (
      <Space size={16}>
        <DeselectButton onClick={props.onCleanSelected}>
          <Icon icon="clear" /> {t("Deselect")}
        </DeselectButton>
        <DeleteButton onClick={() => handleMemberDelete(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Remove")}
        </DeleteButton>
      </Space>
    ),
    [handleMemberDelete, t],
  );

  const options = useMemo(
    () => ({
      fullScreen: true,
      reload: onReload,
    }),
    [onReload],
  );

  return (
    <PaddedContent>
      <PageHeader
        title={t("Members")}
        extra={
          <Button
            type="primary"
            onClick={handleMemberAddModalOpen}
            icon={<Icon icon="userGroupAdd" />}>
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

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
  :hover {
    color: #ff7875b3;
  }
`;

export default MemberTable;
