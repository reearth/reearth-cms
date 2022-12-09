import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentTable from "@reearth-cms/components/molecules/Content/Table";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  commentsPanel?: JSX.Element;
  collapsed?: boolean;
  model?: Model;
  contentTableFields?: ContentTableField[];
  itemsDataLoading: boolean;
  contentTableColumns?: ProColumns<ContentTableField>[];
  modelsMenu: React.ReactNode;
  selectedItem: Item | undefined;
  onItemSelect: (itemId: string) => void;
  onCollapse?: (collapse: boolean) => void;
  onItemAdd: () => void;
  onItemsReload: () => void;
  onItemEdit: (itemId: string) => void;
};

const ContentListMolecule: React.FC<Props> = ({
  commentsPanel,
  collapsed,
  model,
  contentTableFields,
  contentTableColumns,
  modelsMenu,
  itemsDataLoading,
  selectedItem,
  onItemSelect,
  onCollapse,
  onItemAdd,
  onItemsReload,
  onItemEdit,
}) => {
  const t = useT();

  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        <Content>
          <PageHeader
            title={model?.name}
            subTitle={model?.key ? `#${model.key}` : null}
            extra={
              <Button
                type="primary"
                onClick={onItemAdd}
                icon={<Icon icon="plus" />}
                disabled={!model}>
                {t("New Item")}
              </Button>
            }
          />
          <ContentTable
            loading={itemsDataLoading}
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onItemsReload={onItemsReload}
            onItemEdit={onItemEdit}
            contentTableFields={contentTableFields}
            contentTableColumns={contentTableColumns}
          />
        </Content>
      }
      right={commentsPanel}
    />
  );
};

const Content = styled.div`
  width: 100%;
  background-color: #fff;
`;

export default ContentListMolecule;
