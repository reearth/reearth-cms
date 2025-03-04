import styled from "@emotion/styled";
import { Key, useMemo, useCallback } from "react";

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
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { useT, Trans } from "@reearth-cms/i18n";

type Props = {
  integrationMembers?: IntegrationMember[];
  selection: {
    selectedRowKeys: Key[];
  };
  onIntegrationConnectModalOpen: () => void;
  onSearchTerm: (term?: string) => void;
  onIntegrationSettingsModalOpen: (integrationMember: IntegrationMember) => void;
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
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
  integrationMembers,
  selection,
  onIntegrationConnectModalOpen,
  onSearchTerm,
  onIntegrationSettingsModalOpen,
  setSelection,
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

  const columns: StretchColumn<IntegrationMember>[] = useMemo(
    () => [
      {
        title: t("Name"),
        dataIndex: ["integration", "name"],
        key: "name",
        filters: [],
        width: 250,
        minWidth: 100,
      },
      {
        title: t("Role"),
        dataIndex: "integrationRole",
        key: "role",
        render: text => (typeof text === "string" ? t(text) : text),
        width: 100,
        minWidth: 100,
      },
      {
        title: t("Creator"),
        dataIndex: ["integration", "developer", "name"],
        key: "creator",
        width: 250,
        minWidth: 100,
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.integration?.developer.name} size="small" />
            {item.integration?.developer.name}
          </Space>
        ),
      },
      {
        key: "action",
        render: (_, integrationMember) => (
          <Button
            type="link"
            icon={
              <Icon
                size={18}
                onClick={() => onIntegrationSettingsModalOpen(integrationMember)}
                icon="settings"
              />
            }
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
    }),
    [selection, setSelection],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => (
      <Space size={4}>
        <Button
          type="link"
          size="small"
          icon={<Icon icon="delete" />}
          onClick={() => onIntegrationRemove(props.selectedRowKeys)}
          danger
          loading={deleteLoading}
          disabled={!hasDeleteRight}>
          {t("Remove")}
        </Button>
      </Space>
    ),
    [deleteLoading, hasDeleteRight, onIntegrationRemove, t],
  );

  const options = useMemo(
    () => ({
      fullScreen: true,
      reload: onReload,
    }),
    [onReload],
  );

  return (
    <Wrapper>
      <PageHeader
        title={t("Integrations")}
        extra={
          <Button
            type="primary"
            onClick={onIntegrationConnectModalOpen}
            icon={<Icon icon="api" />}
            disabled={!hasConnectRight}>
            {t("Connect Integration")}
          </Button>
        }
      />
      <ConfigProvider
        renderEmpty={() => (
          <EmptyTableWrapper>
            <Title>{t("No Integration yet")}</Title>
            <Suggestion>
              {t("Create a new")}{" "}
              <Button
                onClick={onIntegrationConnectModalOpen}
                type="primary"
                icon={<Icon icon="api" />}
                disabled={!hasConnectRight}>
                {t("Connect Integration")}
              </Button>
            </Suggestion>
            <Suggestion>
              <Trans i18nKey="readDocument" components={{ l: <a href="" /> }} />
            </Suggestion>
          </EmptyTableWrapper>
        )}>
        <TableWrapper>
          <ResizableProTable
            dataSource={integrationMembers}
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const Suggestion = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

const TableWrapper = styled.div`
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  height: calc(100% - 72px);
`;

export default IntegrationTable;
