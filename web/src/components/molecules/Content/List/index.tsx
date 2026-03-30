import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentTable from "@reearth-cms/components/molecules/Content/Table";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import ExperimentIcon from "@reearth-cms/components/molecules/ExperimentIcon";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import {
  ConditionInput,
  CurrentView,
  ItemSort,
} from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";
import { ExportContentUtils } from "@reearth-cms/utils/exportContent";
import { ImportContentUtils } from "@reearth-cms/utils/importContent";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { Field } from "../../Schema/types";

type Props = {
  commentsPanel: JSX.Element;
  viewsMenu: JSX.Element;
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
  onContentExport: (format: ExportFormat, geometryFieldsCount?: number) => void;
  exportContentLoading: boolean;
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
  onContentExport,
  exportContentLoading,
  hasModelFields,
}) => {
  const t = useT();
  const getImportContentUIMetadata = useMemo(
    () =>
      ImportContentUtils.getUIMetadata({ hasContentCreateRight: hasCreateRight, hasModelFields }),
    [hasCreateRight, hasModelFields],
  );

  const getExportContentUIMetadata = useMemo(
    () =>
      ExportContentUtils.getUIMetadata({
        isExportLoading: exportContentLoading,
        hasContent: totalCount > 0,
      }),
    [exportContentLoading, totalCount],
  );

  const getGeometryFieldsCount = useMemo(
    () =>
      model?.schema?.fields?.filter(
        field =>
          field.type === SchemaFieldType.GeometryEditor ||
          field.type === SchemaFieldType.GeometryObject,
      ).length ?? 0,
    [model?.schema?.fields],
  );

  const exportContentMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "export-json",
        label: t("JSON"),
        onClick: () => onContentExport(ExportFormat.Json),
      },
      {
        key: "export-csv",
        label: t("CSV"),
        onClick: () => onContentExport(ExportFormat.Csv),
      },
      {
        key: "export-geojson",
        label: t("GeoJSON"),
        onClick: () => onContentExport(ExportFormat.Geojson, getGeometryFieldsCount),
      },
    ],
    [t, onContentExport, getGeometryFieldsCount],
  );

  const dropdownItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "import content",
        label: (
          <Tooltip title={getImportContentUIMetadata.tooltipMessage}>
            <StyledMenuItem>
              <span>{t("Import")}</span>
              <ExperimentIcon disabled={getImportContentUIMetadata.shouldDisable} />
            </StyledMenuItem>
          </Tooltip>
        ),
        icon: <Icon icon="import" />,
        onClick: onImportModalOpen,
        disabled: getImportContentUIMetadata.shouldDisable,
      },
      {
        key: "export content",
        icon: (
          <IconWrapper>
            <Icon icon={exportContentLoading ? "loading" : "export"} size={AntdToken.FONT.SIZE} />
          </IconWrapper>
        ),
        label: (
          <Tooltip title={getExportContentUIMetadata.tooltipMessage}>
            <StyledMenuItem>
              <span>{t("Export")}</span>
            </StyledMenuItem>
          </Tooltip>
        ),
        disabled: getExportContentUIMetadata.shouldDisable,
        children: exportContentMenuItems,
      },
    ],
    [
      getImportContentUIMetadata.tooltipMessage,
      getImportContentUIMetadata.shouldDisable,
      t,
      onImportModalOpen,
      exportContentLoading,
      getExportContentUIMetadata.tooltipMessage,
      getExportContentUIMetadata.shouldDisable,
      exportContentMenuItems,
    ],
  );

  const DropdownMenu = useCallback(
    () => (
      <Dropdown key="more" menu={{ items: dropdownItems }} placement="bottomRight">
        <Button type="text" icon={<Icon icon="more" size={AntdToken.FONT.SIZE_XL} />} />
      </Dropdown>
    ),
    [dropdownItems],
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
                    <DropdownMenu key="more" />
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
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const StyledPageHeder = styled(PageHeader)`
  padding: ${AntdToken.SPACING.BASE}px ${AntdToken.SPACING.LG}px 0px ${AntdToken.SPACING.LG}px !important;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`;

const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
`;

export default ContentListMolecule;
