import styled from "@emotion/styled";
import { Key, useMemo, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  integrationMembers?: IntegrationMember[];
  selection: {
    selectedRowKeys: Key[];
  };
  onIntegrationConnectModalOpen: () => void;
  onSearchTerm: (term?: string) => void;
  onIntegrationSettingsModalOpen: (integrationMember: IntegrationMember) => void;
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
};

const IntegrationTable: React.FC<Props> = ({
  integrationMembers,
  selection,
  onIntegrationConnectModalOpen,
  onSearchTerm,
  onIntegrationSettingsModalOpen,
  setSelection,
  onIntegrationRemove,
}) => {
  const t = useT();

  const columns: ProColumns<IntegrationMember>[] = useMemo(
    () => [
      {
        title: t("Name"),
        dataIndex: ["integration", "name"],
        key: "name",
        filters: [],
      },
      {
        title: t("Role"),
        dataIndex: "integrationRole",
        key: "role",
      },
      {
        title: t("Creator"),
        dataIndex: ["integration", "developer", "name"],
        key: "creator",
      },
      {
        key: "action",
        render: (_, integrationMember) => (
          <StyledIcon
            onClick={() => onIntegrationSettingsModalOpen(integrationMember)}
            icon="settings"
          />
        ),
      },
    ],
    [onIntegrationSettingsModalOpen, t],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Input.Search
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

  const AlertOptions = useCallback(
    (props: any) => {
      return (
        <Space size={16}>
          <DeselectButton onClick={props.onCleanSelected}>
            <Icon icon="clear" /> {t("Deselect")}
          </DeselectButton>
          <DeleteButton onClick={() => onIntegrationRemove?.(props.selectedRowKeys)}>
            <Icon icon="delete" /> {t("Remove")}
          </DeleteButton>
        </Space>
      );
    },
    [onIntegrationRemove, t],
  );

  const options = useMemo(
    () => ({
      fullScreen: true,
      reload: false,
      setting: true,
    }),
    [],
  );

  return (
    <Wrapper>
      <PageHeader
        title={t("Integrations")}
        extra={
          <Button type="primary" onClick={onIntegrationConnectModalOpen} icon={<Icon icon="api" />}>
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
                icon={<Icon icon="api" />}>
                {t("Connect Integration")}
              </Button>
            </Suggestion>
            <Suggestion>
              {t("Or read")} <a href="">{t("how to use Re:Earth CMS")}</a> {t("first")}
            </Suggestion>
          </EmptyTableWrapper>
        )}>
        <ProTable
          options={options}
          dataSource={integrationMembers}
          columns={columns}
          tableAlertOptionRender={AlertOptions}
          search={false}
          rowKey="id"
          toolbar={toolbar}
          rowSelection={rowSelection}
          pagination={false}
        />
      </ConfigProvider>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 100%;
  background-color: #fff;
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

export default IntegrationTable;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;

const StyledIcon = styled(Icon)`
  color: #1890ff;
  font-size: 18px;
`;
