import { ColumnsState } from "@ant-design/pro-table";
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
import { SortDirection, FieldSelectorInput } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  commentsPanel?: JSX.Element;
  viewsMenu: JSX.Element;
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
  sort?: { field?: FieldSelectorInput; direction?: SortDirection };
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  columns: Record<string, ColumnsState>;
  setColumns: (input: Record<string, ColumnsState>) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onContentTableChange: (
    page: number,
    pageSize: number,
    sorter?: { field?: FieldSelectorInput; direction?: SortDirection },
  ) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
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
  viewsMenu,
  collapsed,
  model,
  contentTableFields,
  contentTableColumns,
  modelsMenu,
  itemsDataLoading,
  selectedItem,
  selection,
  totalCount,
  sort,
  searchTerm,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  columns,
  setColumns,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onUnpublish,
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
          <StyledPageHeder
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
          {viewsMenu}
          <ContentTable
            totalCount={totalCount}
            sort={sort}
            searchTerm={searchTerm}
            page={page}
            pageSize={pageSize}
            loading={itemsDataLoading}
            selectedItem={selectedItem}
            selection={selection}
            onUnpublish={onUnpublish}
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
            onRequestTableChange={onRequestTableChange}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            columns={columns}
            setColumns={setColumns}
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

const StyledPageHeder = styled(PageHeader)`
  padding: 16px 24px 0px 24px !important;
`;

export default ContentListMolecule;
