import styled from "@emotion/styled";
import { Key, useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import {
  ListToolBarProps,
  StretchColumn,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { Trans, useT } from "@reearth-cms/i18n";

type Props = {
  deleteLoading: boolean;
  hasConnectRight: boolean;
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  loading: boolean;
  onIntegrationConnectModalOpen: () => void;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
  onIntegrationSettingsModalOpen: (integrationMember: WorkspaceIntegration) => void;
  onSearchTerm: (term?: string) => void;
  onTableChange: (page: number, pageSize: number) => void;
  page: number;
  pageSize: number;
  workspaceIntegrations?: WorkspaceIntegration[];
};

const IntegrationTable: React.FC<Props> = ({
  deleteLoading,
  hasConnectRight,
  hasDeleteRight,
  hasUpdateRight,
  loading,
  onIntegrationConnectModalOpen,
  onIntegrationRemove,
  onIntegrationSettingsModalOpen,
  onSearchTerm,
  onTableChange,
  page,
  pageSize,
  workspaceIntegrations,
}) => {
  const t = useT();

  const [selection, setSelection] = useState<Key[]>([]);

  const columns: StretchColumn<WorkspaceIntegration>[] = useMemo(
    () => [
      {
        dataIndex: "name",
        filters: [],
        key: "name",
        minWidth: 100,
        title: t("Name"),
        width: 250,
      },
      {
        dataIndex: "role",
        key: "role",
        minWidth: 100,
        render: text => (typeof text === "string" ? t(text) : text),
        title: t("Role"),
        width: 100,
      },
      {
        dataIndex: ["createdBy", "name"],
        key: "creator",
        minWidth: 100,
        render: (_, item) => item.createdBy?.name,
        title: t("Creator"),
        width: 250,
      },
      {
        key: "action",
        minWidth: 48,
        render: (_, integrationMember) => (
          <Button
            disabled={!hasUpdateRight}
            icon={<Icon icon="settings" size={18} />}
            onClick={() => onIntegrationSettingsModalOpen(integrationMember)}
            type="link"
          />
        ),
        width: 48,
      },
    ],
    [hasUpdateRight, onIntegrationSettingsModalOpen, t],
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
      pageSize,
      showSizeChanger: true,
    }),
    [page, pageSize],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      onChange: (selectedRowKeys: Key[]) => {
        setSelection(selectedRowKeys);
      },
      selectedRowKeys: selection,
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
          danger
          disabled={!hasDeleteRight}
          icon={<Icon icon="delete" />}
          loading={deleteLoading}
          onClick={() => handleRemove(props.selectedRowKeys)}
          size="small"
          type="link">
          {t("Remove")}
        </Button>
      </Space>
    ),
    [deleteLoading, handleRemove, hasDeleteRight, t],
  );

  const ConnectButton = useCallback(
    () => (
      <Button
        disabled={!hasConnectRight}
        icon={<Icon icon="api" />}
        onClick={onIntegrationConnectModalOpen}
        type="primary">
        {t("Connect Integration")}
      </Button>
    ),
    [hasConnectRight, onIntegrationConnectModalOpen, t],
  );

  return (
    <Wrapper>
      <PageHeader
        extra={<ConnectButton />}
        style={{ backgroundColor: "#fff" }}
        title={t("Integrations")}
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
              <Trans components={{ l: <a href="" /> }} i18nKey="readDocument" />
            </span>
          </EmptyTableWrapper>
        )}>
        <TableWrapper>
          <ResizableProTable
            columns={columns}
            dataSource={workspaceIntegrations}
            heightOffset={0}
            loading={loading}
            onChange={pagination => {
              onTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
            }}
            options={false}
            pagination={pagination}
            rowKey="id"
            rowSelection={rowSelection}
            search={false}
            tableAlertOptionRender={alertOptions}
            toolbar={toolbar}
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
