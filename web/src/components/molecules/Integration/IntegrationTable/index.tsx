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
import { useT, Trans } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils.ts";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
  hasConnectRight,
  hasUpdateRight,
  hasDeleteRight,
}) => {
  const t = useT();

  const [selection, setSelection] = useState<Key[]>([]);

  const columns = useMemo<StretchColumn<WorkspaceIntegration>[]>(
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
        render: (_, item) => item.createdBy?.name,
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

  const toolbar = useMemo<ListToolBarProps>(
    () => ({
      search: (
        <StyledSearch
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

  const rowSelection = useMemo<TableRowSelection>(
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
      <Space size={AntdToken.SPACING.XXS}>
        <Button
          type="link"
          size="small"
          icon={<Icon icon="delete" />}
          onClick={() => handleRemove(props.selectedRowKeys)}
          danger
          loading={deleteLoading}
          disabled={!hasDeleteRight}
          data-testid={DATA_TEST_ID.IntegrationTable__RemoveButton}>
          {t("Remove")}
        </Button>
      </Space>
    ),
    [deleteLoading, handleRemove, hasDeleteRight, t],
  );

  const ConnectButton = useCallback(
    () => (
      <Button
        type="primary"
        onClick={onIntegrationConnectModalOpen}
        icon={<Icon icon="api" />}
        disabled={!hasConnectRight}
        data-testid={DATA_TEST_ID.IntegrationTable__ConnectIntegrationButton}>
        {t("Connect Integration")}
      </Button>
    ),
    [hasConnectRight, onIntegrationConnectModalOpen, t],
  );

  return (
    <Wrapper>
      <PageHeader
        title={t("Integrations")}
        style={{ backgroundColor: AntdColor.NEUTRAL.BG_WHITE }}
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
            options={false}
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
  padding: ${AntdToken.SPACING.BASE}px ${AntdToken.SPACING.BASE}px 0;
`;

const EmptyTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  margin: ${AntdToken.SPACING.LG}px 0;
  color: ${AntdColor.GREY.GREY_2};
`;

const Action = styled.span`
  display: flex;
  gap: ${AntdToken.SPACING.BASE}px;
  align-items: center;
`;

const Title = styled.h2`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  color: ${AntdColor.GREY.GREY_8};
  margin-bottom: ${AntdToken.SPACING.BASE}px;
`;

const TableWrapper = styled.div`
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  height: calc(100% - 72px);
`;

const StyledSearch = styled(Search)`
  max-width: 250px;
`;

export default IntegrationTable;
