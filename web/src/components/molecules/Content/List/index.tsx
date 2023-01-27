import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentTable from "@reearth-cms/components/molecules/Content/Table";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  ItemSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
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
  selection: {
    selectedRowKeys: string[];
  };
  totalCount: number;
  page: number;
  pageSize: number;
  onSearchTerm: (term?: string) => void;
  onContentTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: ItemSortType; direction?: SortDirection },
  ) => void;
  onItemSelect: (itemId: string) => void;
  setSelection: (input: { selectedRowKeys: string[] }) => void;
  onCollapse?: (collapse: boolean) => void;
  onItemAdd: () => void;
  onItemsReload: () => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  requests: Request[];
  addItemToRequestModalShown: boolean;
  onAddItemToRequest: (request: Request, itemIds: string[]) => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
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
  selection,
  totalCount,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onSearchTerm,
  onContentTableChange,
  setSelection,
  onItemSelect,
  onCollapse,
  onItemAdd,
  onItemsReload,
  onItemEdit,
  onItemDelete,
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
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            loading={itemsDataLoading}
            selectedItem={selectedItem}
            selection={selection}
            onSearchTerm={onSearchTerm}
            onContentTableChange={onContentTableChange}
            setSelection={setSelection}
            onItemSelect={onItemSelect}
            onItemsReload={onItemsReload}
            onItemEdit={onItemEdit}
            contentTableFields={contentTableFields}
            contentTableColumns={contentTableColumns}
            onItemDelete={onItemDelete}
            requests={requests}
            addItemToRequestModalShown={addItemToRequestModalShown}
            onAddItemToRequest={onAddItemToRequest}
            onAddItemToRequestModalClose={onAddItemToRequestModalClose}
            onAddItemToRequestModalOpen={onAddItemToRequestModalOpen}
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
