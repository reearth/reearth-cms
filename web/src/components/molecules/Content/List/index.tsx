import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentTable from "@reearth-cms/components/molecules/Content/Table";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import {
  ConditionInput,
  CurrentView,
  ItemSort,
} from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { ImportContentUtils } from "@reearth-cms/utils/importContent";

import { Field } from "../../Schema/types";

type Props = {
  addItemToRequestModalShown: boolean;
  collapsed: boolean;
  commentsPanel: JSX.Element;
  contentTableColumns?: ExtendedColumns[];
  contentTableFields?: ContentTableField[];
  currentView: CurrentView;
  deleteLoading: boolean;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasModelFields: boolean;
  hasPublishRight: boolean;
  hasRequestUpdateRight: boolean;
  loading: boolean;
  model?: Model;
  modelFields: Field[];
  modelsMenu: React.ReactNode;
  onAddItemToRequest: (request: Request, items: RequestItem[]) => Promise<void>;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onCollapse?: (collapse: boolean) => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
  onFilterChange: (filter?: ConditionInput[]) => void;
  onImportModalOpen: () => void;
  onItemAdd: () => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onItemEdit: (itemId: string) => void;
  onItemSelect: (itemId: string) => void;
  onItemsReload: () => void;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestTableReload: () => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: ContentTableField[]) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestModalLoading: boolean;
  requestModalPage: number;
  requestModalPageSize: number;
  requestModalTotalCount: number;
  requests: Request[];
  searchTerm: string;
  selectedItem?: Item;
  selectedItems: { selectedRows: { itemId: string; version?: string }[] };
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
  showPublishAction: boolean;
  totalCount: number;
  unpublishLoading: boolean;
  viewsMenu: JSX.Element;
};

const ContentListMolecule: React.FC<Props> = ({
  addItemToRequestModalShown,
  collapsed,
  commentsPanel,
  contentTableColumns,
  contentTableFields,
  currentView,
  deleteLoading,
  hasCreateRight,
  hasDeleteRight,
  hasModelFields,
  hasPublishRight,
  hasRequestUpdateRight,
  loading,
  model,
  modelsMenu,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onCollapse,
  onContentTableChange,
  onFilterChange,
  onImportModalOpen,
  onItemAdd,
  onItemDelete,
  onItemEdit,
  onItemSelect,
  onItemsReload,
  onPublish,
  onRequestSearchTerm,
  onRequestTableChange,
  onRequestTableReload,
  onSearchTerm,
  onSelect,
  onUnpublish,
  page,
  pageSize,
  publishLoading,
  requestModalLoading,
  requestModalPage,
  requestModalPageSize,
  requestModalTotalCount,
  requests,
  searchTerm,
  selectedItem,
  selectedItems,
  setCurrentView,
  showPublishAction,
  totalCount,
  unpublishLoading,
  viewsMenu,
}) => {
  const t = useT();
  const getImportContentUIMetadata = useMemo(
    () =>
      ImportContentUtils.getUIMetadata({ hasContentCreateRight: hasCreateRight, hasModelFields }),
    [hasCreateRight, hasModelFields],
  );

  return (
    <ComplexInnerContents
      center={
        <Content>
          {model && (
            <>
              <StyledPageHeder
                extra={
                  <>
                    <Tooltip title={getImportContentUIMetadata.tooltipMessage}>
                      <Button
                        data-testid={DATA_TEST_ID.Content__List__ImportContentButton}
                        disabled={getImportContentUIMetadata.shouldDisable}
                        icon={<Icon icon="import" />}
                        onClick={onImportModalOpen}
                        type="default">
                        {t("Import content")}
                      </Button>
                    </Tooltip>
                    <Button
                      disabled={!model || !hasCreateRight}
                      icon={<Icon icon="plus" />}
                      onClick={onItemAdd}
                      type="primary">
                      {t("New Item")}
                    </Button>
                  </>
                }
                subTitle={model?.key ? `#${model.key}` : null}
                title={model?.name}
              />
              {viewsMenu}
              <ContentTable
                addItemToRequestModalShown={addItemToRequestModalShown}
                contentTableColumns={contentTableColumns}
                contentTableFields={contentTableFields}
                currentView={currentView}
                deleteLoading={deleteLoading}
                hasCreateRight={hasCreateRight}
                hasDeleteRight={hasDeleteRight}
                hasModelFields={hasModelFields}
                hasPublishRight={hasPublishRight}
                hasRequestUpdateRight={hasRequestUpdateRight}
                loading={loading}
                modelKey={model?.key}
                onAddItemToRequest={onAddItemToRequest}
                onAddItemToRequestModalClose={onAddItemToRequestModalClose}
                onAddItemToRequestModalOpen={onAddItemToRequestModalOpen}
                onContentTableChange={onContentTableChange}
                onFilterChange={onFilterChange}
                onImportModalOpen={onImportModalOpen}
                onItemDelete={onItemDelete}
                onItemEdit={onItemEdit}
                onItemSelect={onItemSelect}
                onItemsReload={onItemsReload}
                onPublish={onPublish}
                onRequestSearchTerm={onRequestSearchTerm}
                onRequestTableChange={onRequestTableChange}
                onRequestTableReload={onRequestTableReload}
                onSearchTerm={onSearchTerm}
                onSelect={onSelect}
                onUnpublish={onUnpublish}
                page={page}
                pageSize={pageSize}
                publishLoading={publishLoading}
                requestModalLoading={requestModalLoading}
                requestModalPage={requestModalPage}
                requestModalPageSize={requestModalPageSize}
                requestModalTotalCount={requestModalTotalCount}
                requests={requests}
                searchTerm={searchTerm}
                selectedItem={selectedItem}
                selectedItems={selectedItems}
                setCurrentView={setCurrentView}
                showPublishAction={showPublishAction}
                totalCount={totalCount}
                unpublishLoading={unpublishLoading}
              />
            </>
          )}
        </Content>
      }
      left={
        <Sidebar
          collapsed={collapsed}
          collapsedWidth={54}
          onCollapse={onCollapse}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}
          width={208}>
          {modelsMenu}
        </Sidebar>
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
