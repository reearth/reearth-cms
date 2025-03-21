import styled from "@emotion/styled";
import { Key, useMemo, useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import {
  ListToolBarProps,
  TableRowSelection,
  StretchColumn,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { useT, Trans } from "@reearth-cms/i18n";

type Props = {
  workspaceIntegrations?: WorkspaceIntegration[];
  onIntegrationConnectModalOpen: () => void;
  onSearchTerm: (term?: string) => void;
  onIntegrationSettingsModalOpen: (integrationMember: WorkspaceIntegration) => void;
  deleteLoading: boolean;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  loading: boolean;
  onReload: () => void;
  hasConnectRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
};

const IntegrationTable: React.FC<Props> = ({
  workspaceIntegrations,
  onIntegrationConnectModalOpen,
  onSearchTerm,
  onIntegrationSettingsModalOpen,
  deleteLoading,
  onIntegrationRemove,
  page,
  pageSize,
  onTableChange,
  loading,
  onReload,
  hasConnectRight,
  hasUpdateRight,
  hasDeleteRight,
}) => {
  const t = useT();

  const [selection, setSelection] = useState<Key[]>([]);

  const columns: StretchColumn<WorkspaceIntegration>[] = useMemo(
    () => [
      {
        title: t("Name"),
        dataIndex: "name",
        key: "name",
        filters: [],
        width: 250,
        minWidth: 100,
      },
      {
        title: t("Role"),
        dataIndex: "role",
        key: "role",
        render: text => (typeof text === "string" ? t(text) : text),
        width: 100,
        minWidth: 100,
      },
      {
        title: t("Creator"),
        dataIndex: ["createdBy", "name"],
        key: "creator",
        width: 250,
        minWidth: 100,
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy?.name} size="small" />
            {item.createdBy?.name}
          </Space>
        ),
      },
      {
        key: "action",
        render: (_, integrationMember) => (
          <Button
            type="link"
            onClick={() => onIntegrationSettingsModalOpen(integrationMember)}
            icon={<Icon size={18} icon="settings" />}
            disabled={!hasUpdateRight}
          />
        ),
        width: 48,
        minWidth: 48,
      },
    ],
    [hasUpdateRight, onIntegrationSettingsModalOpen, t],
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
      pageSize,
    }),
    [page, pageSize],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selection,
      onChange: (selectedRowKeys: Key[]) => {
        setSelection(selectedRowKeys);
      },
    }),
    [selection, setSelection],
  );

  const handleRemove = useCallback(
    async (keys: Key[]) => {
      try {
        await onIntegrationRemove(keys.map(key => key.toString()));
        setSelection([]);
      } catch (e) {
        console.error(e);
      }
    },
    [onIntegrationRemove, setSelection],
  );

  const alertOptions = useCallback(
    (props: { selectedRowKeys: Key[] }) => (
      <Space size={4}>
        <Button
          type="link"
          size="small"
          icon={<Icon icon="delete" />}
          onClick={() => handleRemove(props.selectedRowKeys)}
          danger
          loading={deleteLoading}
          disabled={!hasDeleteRight}>
          {t("Remove")}
        </Button>
      </Space>
    ),
    [deleteLoading, handleRemove, hasDeleteRight, t],
  );

  const options = useMemo(
    () => ({
      fullScreen: true,
      reload: onReload,
    }),
    [onReload],
  );

  const ConnectButton = useCallback(
    () => (
      <Button
        type="primary"
        onClick={onIntegrationConnectModalOpen}
        icon={<Icon icon="api" />}
        disabled={!hasConnectRight}>
        {t("Connect Integration")}
      </Button>
    ),
    [hasConnectRight, onIntegrationConnectModalOpen, t],
  );

  return (
    <Wrapper>
      <PageHeader
        title={t("Integrations")}
        style={{ backgroundColor: "#fff" }}
        extra={<ConnectButton />}
      />
      <ConfigProvider
        renderEmpty={() => (
          <EmptyTableWrapper>
            <Title>{t("No Integration yet")}</Title>
            <Action>
              {t("Create a new")}
              <ConnectButton />
            </Action>
            <span>
              <Trans i18nKey="readDocument" components={{ l: <a href="" /> }} />
            </span>
          </EmptyTableWrapper>
        )}>
        <TableWrapper>
          <ResizableProTable
            dataSource={workspaceIntegrations}
            columns={columns}
            tableAlertOptionRender={alertOptions}
            search={false}
            rowKey="id"
            options={options}
            pagination={pagination}
            toolbar={toolbar}
            rowSelection={rowSelection}
            loading={loading}
            heightOffset={0}
            onChange={pagination => {
              onTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
            }}
          />
        </TableWrapper>
      </ConfigProvider>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  padding: 16px 16px 0;
`;

const EmptyTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
  color: #8c8c8c;
`;

const Action = styled.span`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Title = styled.h2`
  font-weight: 500;
  font-size: 16px;
  color: #000;
  margin-bottom: 16px;
`;

const TableWrapper = styled.div`
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  height: calc(100% - 72px);
`;

export default IntegrationTable;
