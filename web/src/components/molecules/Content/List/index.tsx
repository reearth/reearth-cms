import styled from "@emotion/styled";
import React, { Dispatch, Key, SetStateAction, useMemo } from "react";

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
  commentsPanel: React.JSX.Element;
  viewsMenu: React.JSX.Element;
  collapsed: boolean;
  model?: Model;
  contentTableFields?: ContentTableField[];
  loading: boolean;
  deleteLoading: boolean;
  publishLoading: boolean;
  unpublishLoading: boolean;
  contentTableColumns?: ExtendedColumns[];
  modelsMenu: React.ReactNode;
  selectedItem?: Item;
  selectedItems: { selectedRows: { itemId: string; version?: string }[] };
  totalCount: number;
  currentView: CurrentView;
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onFilterChange: (filter?: ConditionInput[]) => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
  onPublish: (itemIds: string[]) => Promise<void>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onItemSelect: (itemId: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: ContentTableField[]) => void;
  onCollapse?: (collapse: boolean) => void;
  onItemAdd: () => void;
  onItemsReload: () => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  requests: Request[];
  addItemToRequestModalShown: boolean;
  onAddItemToRequest: (request: Request, items: RequestItem[]) => Promise<void>;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  hasRequestUpdateRight: boolean;
  showPublishAction: boolean;
  onImportModalOpen: () => void;
  modelFields: Field[];
  hasModelFields: boolean;
};

const ContentListMolecule: React.FC<Props> = ({
  commentsPanel,
  viewsMenu,
  collapsed,
  model,
  contentTableFields,
  contentTableColumns,
  modelsMenu,
  loading,
  deleteLoading,
  publishLoading,
  unpublishLoading,
  selectedItem,
  selectedItems,
  totalCount,
  currentView,
  searchTerm,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  setCurrentView,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onPublish,
  onUnpublish,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onSearchTerm,
  onFilterChange,
  onContentTableChange,
  onSelect,
  onItemSelect,
  onCollapse,
  onItemAdd,
  onItemsReload,
  onItemEdit,
  onItemDelete,
  onRequestSearchTerm,
  onRequestTableReload,
  hasCreateRight,
  hasDeleteRight,
  hasPublishRight,
  hasRequestUpdateRight,
  showPublishAction,
  onImportModalOpen,
  hasModelFields,
}) => {
  const t = useT();
  const getImportContentUIMetadata = useMemo(
    () =>
      ImportContentUtils.getUIMetadata({ hasContentCreateRight: hasCreateRight, hasModelFields }),
    [hasCreateRight, hasModelFields],
  );

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
          {model && (
            <>
              <StyledPageHeder
                title={model?.name}
                subTitle={model?.key ? `#${model.key}` : null}
                extra={
                  <>
                    <Tooltip title={getImportContentUIMetadata.tooltipMessage}>
                      <Button
                        type="default"
                        data-testid={DATA_TEST_ID.Content__List__ImportContentButton}
                        onClick={onImportModalOpen}
                        icon={<Icon icon="import" />}
                        disabled={getImportContentUIMetadata.shouldDisable}>
                        {t("Import content")}
                      </Button>
                    </Tooltip>
                    <Button
                      type="primary"
                      onClick={onItemAdd}
                      icon={<Icon icon="plus" />}
                      disabled={!model || !hasCreateRight}>
                      {t("New Item")}
                    </Button>
                  </>
                }
              />
              {viewsMenu}
              <ContentTable
                totalCount={totalCount}
                currentView={currentView}
                searchTerm={searchTerm}
                page={page}
                pageSize={pageSize}
                loading={loading}
                deleteLoading={deleteLoading}
                publishLoading={publishLoading}
                unpublishLoading={unpublishLoading}
                selectedItem={selectedItem}
                selectedItems={selectedItems}
                onPublish={onPublish}
                onUnpublish={onUnpublish}
                onSearchTerm={onSearchTerm}
                onFilterChange={onFilterChange}
                onContentTableChange={onContentTableChange}
                onSelect={onSelect}
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
                setCurrentView={setCurrentView}
                modelKey={model?.key}
                onRequestSearchTerm={onRequestSearchTerm}
                onRequestTableReload={onRequestTableReload}
                hasDeleteRight={hasDeleteRight}
                hasPublishRight={hasPublishRight}
                hasRequestUpdateRight={hasRequestUpdateRight}
                hasCreateRight={hasCreateRight}
                showPublishAction={showPublishAction}
                onImportModalOpen={onImportModalOpen}
                hasModelFields={hasModelFields}
              />
            </>
          )}
        </Content>
      }
      right={commentsPanel}
    />
  );
};

const Content = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
`;

const StyledPageHeder = styled(PageHeader)`
  padding: 16px 24px 0 24px !important;
`;

export default ContentListMolecule;
