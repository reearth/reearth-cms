import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { ImportContentUtils } from "@reearth-cms/utils/importContent";
import { ImportSchemaUtils } from "@reearth-cms/utils/importSchema";

export type Props = {
  exportLoading?: boolean;
  hasContentCreateRight: boolean;
  hasDeleteRight: boolean;
  hasSchemaCreateRight: boolean;
  hasUpdateRight: boolean;
  model: Model;
  onContentNavigate: (modelId: string) => void;
  onImportContentNavigate: (modelId: string) => void;
  onImportSchemaNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelExport: (modelId?: string, format?: ExportFormat) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
  onSchemaNavigate: (modelId: string) => void;
};

const ModelCard: React.FC<Props> = ({
  exportLoading,
  hasContentCreateRight,
  hasDeleteRight,
  hasSchemaCreateRight,
  hasUpdateRight,
  model,
  onContentNavigate,
  onImportContentNavigate,
  onImportSchemaNavigate,
  onModelDeletionModalOpen,
  onModelExport,
  onModelUpdateModalOpen,
  onSchemaNavigate,
}) => {
  const t = useT();
  const { confirm, error } = useModal();

  const { Meta } = Card;

  const hasModelFields = useMemo<boolean>(
    () => model.schema.fields.length > 0,
    [model.schema.fields],
  );

  const handleCSVExport = useCallback(
    async (exportType: ExportFormat) => {
      confirm({
        content: (
          <ModalContent>
            <div>{t("CSV export only supports simple fields (text, number, date).")}</div>
            <div>{t("Relations, arrays, objects, and geometry fields are not included.")}</div>
            <div>
              {t("For a complete export with all fields, please use the JSON export option.")}
            </div>
          </ModalContent>
        ),
        okText: t("Export CSV"),
        async onOk() {
          await onModelExport(model.id, exportType);
        },
        title: t("Export as CSV"),
        width: 550,
      });
    },
    [confirm, model.id, onModelExport, t],
  );

  const getGeometryFieldsCount = useCallback(() => {
    return (
      model.schema?.fields?.filter(
        field =>
          field.type === SchemaFieldType.GeometryEditor ||
          field.type === SchemaFieldType.GeometryObject,
      ).length ?? 0
    );
  }, [model.schema?.fields]);

  const handleGeoJSONExport = useCallback(
    async (exportType: ExportFormat) => {
      const geoFieldsCount = getGeometryFieldsCount();
      if (geoFieldsCount === 0) {
        error({
          content: (
            <ModalContent>
              <div>
                {t(
                  "No Geometry field was found in this model, so GeoJSON export is not available.",
                )}
              </div>
            </ModalContent>
          ),
          okText: t("OK"),
          title: t("Cannot export GeoJSON"),
        });
      } else if (geoFieldsCount > 1) {
        confirm({
          content: (
            <ModalContent>
              <div>{t("This model has multiple Geometry fields.")}</div>
              <div>{t("GeoJSON format supports only one geometry field.")}</div>
              <div>
                {t(
                  "Only the first Geometry field will be exported. Please adjust your data if needed.",
                )}
              </div>
            </ModalContent>
          ),
          okText: t("Export Anyway"),
          async onOk() {
            await onModelExport(model.id, exportType);
          },
          title: t("Multiple Geometry fields detected"),
          width: 550,
        });
      } else {
        await onModelExport(model.id, exportType);
      }
    },
    [confirm, error, getGeometryFieldsCount, model.id, onModelExport, t],
  );

  const handleModelExportClick = useCallback(
    async (exportType: ExportFormat) => {
      if (exportType === ExportFormat.Csv) {
        await handleCSVExport(exportType);
      } else if (exportType === ExportFormat.Geojson) {
        await handleGeoJSONExport(exportType);
      } else {
        await onModelExport(model.id, exportType);
      }
    },
    [handleCSVExport, handleGeoJSONExport, model.id, onModelExport],
  );

  const getImportSchemaUIMetadata = useMemo(
    () => ImportSchemaUtils.getUIMetadata({ hasModelFields, hasSchemaCreateRight }),
    [hasModelFields, hasSchemaCreateRight],
  );
  const getImportContentUIMetadata = useMemo(
    () => ImportContentUtils.getUIMetadata({ hasContentCreateRight, hasModelFields }),
    [hasContentCreateRight, hasModelFields],
  );

  const ImportMenuItems = useMemo<MenuProps[]>(
    () => [
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownImportSchema,
        disabled: getImportSchemaUIMetadata.shouldDisable,
        key: "schema",
        label: (
          <Tooltip title={getImportSchemaUIMetadata.tooltipMessage}>{t("Import Schema")}</Tooltip>
        ),
        onClick: () => onImportSchemaNavigate(model.id),
      },
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownImportContent,
        disabled: getImportContentUIMetadata.shouldDisable,
        key: "content",
        label: (
          <Tooltip title={getImportContentUIMetadata.tooltipMessage}>{t("Import content")}</Tooltip>
        ),
        onClick: () => onImportContentNavigate(model.id),
      },
    ],
    [
      getImportContentUIMetadata.shouldDisable,
      getImportContentUIMetadata.tooltipMessage,
      getImportSchemaUIMetadata.shouldDisable,
      getImportSchemaUIMetadata.tooltipMessage,
      model.id,
      onImportContentNavigate,
      onImportSchemaNavigate,
      t,
    ],
  );

  const ExportMenuItems = useMemo<MenuProps[]>(
    () => [
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportSchema,
        disabled: exportLoading,
        key: "schema",
        label: t("Export Schema"),
        onClick: () => handleModelExportClick(ExportFormat.Schema),
      },
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentJSON,
        disabled: exportLoading,
        key: "json",
        label: t("Export as JSON"),
        onClick: () => handleModelExportClick(ExportFormat.Json),
      },
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentCSV,
        disabled: exportLoading,
        key: "csv",
        label: t("Export as CSV"),
        onClick: () => handleModelExportClick(ExportFormat.Csv),
      },
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON,
        disabled: exportLoading,
        key: "geojson",
        label: t("Export as GeoJSON"),
        onClick: () => handleModelExportClick(ExportFormat.Geojson),
      },
    ],
    [t, handleModelExportClick, exportLoading],
  );

  const OptionsMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownEdit,
        disabled: !hasUpdateRight,
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
      },
      {
        children: ImportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownImport,
        key: "import",
        label: t("Import"),
      },
      {
        children: ExportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExport,
        key: "export",
        label: t("Export"),
      },
      {
        danger: true,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownDelete,
        disabled: !hasDeleteRight,
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
      },
    ],
    [
      t,
      hasUpdateRight,
      ImportMenuItems,
      ExportMenuItems,
      hasDeleteRight,
      onModelUpdateModalOpen,
      model,
      onModelDeletionModalOpen,
    ],
  );

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate(model.id)} />,
        <Dropdown key="options" menu={{ items: OptionsMenuItems }} trigger={["click"]}>
          <a
            data-testid={DATA_TEST_ID.ModelCard__UtilDropdownIcon}
            onClick={e => e.preventDefault()}>
            <Icon icon="ellipsis" />
          </a>
        </Dropdown>,
      ]}>
      <Meta description={model.description} title={model.name} />
    </StyledCard>
  );
};

export default ModelCard;

const StyledCard = styled(Card)`
  .ant-card-body {
    height: 102px;
  }
  .ant-card-meta-description {
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
