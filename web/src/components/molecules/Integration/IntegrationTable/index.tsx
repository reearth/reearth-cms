import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  // OptionConfig,
  // TableRowSelection,
  // TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Switch from "@reearth-cms/components/atoms/Switch";
import IntegrationHeader from "@reearth-cms/components/molecules/Integration/IntegrationHeader";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  integrationMembers: IntegrationMember[];
  onIntegrationConnectModalOpen: () => void;
  onSearchTerm: (term?: string) => void;
  onIntegrationSettingsModalOpen: (integrationMember: IntegrationMember) => void;
};

const IntegrationTable: React.FC<Props> = ({
  integrationMembers,
  onIntegrationConnectModalOpen,
  onSearchTerm,
  onIntegrationSettingsModalOpen,
}) => {
  const t = useT();

  const columns: ProColumns<IntegrationMember>[] = [
    {
      title: t("Name"),
      dataIndex: ["integration", "name"],
      key: "name",
      filters: [],
    },
    {
      title: t("State"),
      key: "state",
      render: (_, integrationMember) => (
        <Switch
          checked={integrationMember.active}
          checkedChildren={t("ON")}
          unCheckedChildren={t("OFF")}
        />
      ),
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
        <Icon
          style={{ color: "#1890FF", fontSize: "18px" }}
          onClick={() => onIntegrationSettingsModalOpen(integrationMember)}
          icon="settings"
        />
      ),
    },
  ];

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: (value: string) => {
        if (value) {
          onSearchTerm(value);
        } else {
          onSearchTerm();
        }
      },
    },
  };

  return (
    <Wrapper>
      <IntegrationHeader onConnect={onIntegrationConnectModalOpen} />
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
          dataSource={integrationMembers}
          columns={columns}
          search={false}
          rowKey="id"
          toolbar={handleToolbarEvents}
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
