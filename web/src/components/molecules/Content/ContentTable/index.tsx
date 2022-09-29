import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { useT } from "@reearth-cms/i18n";

const columns: ProColumns<any>[] = [];

const ContentTable: React.FC = () => {
  const dataSource: [] = [];
  const t = useT();

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ConfigProvider
      renderEmpty={() => (
        <EmptyTableWrapper>
          <Title>{t("No Items yet")}</Title>
          <Suggestion>
            {t("Create a new")}{" "}
            <Button onClick={() => {}} type="primary">
              {t("New Item")}
            </Button>
          </Suggestion>
          <Suggestion>
            {t("Or read")} <a href="">{t("how to use Re:Earth CMS")}</a> {t("first")}
          </Suggestion>
        </EmptyTableWrapper>
      )}>
      <ProTable
        dataSource={dataSource}
        columns={columns}
        search={false}
        rowKey="id"
        toolbar={handleToolbarEvents}
      />
    </ConfigProvider>
  );
};

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

export default ContentTable;
