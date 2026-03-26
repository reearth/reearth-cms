import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Card from "@reearth-cms/components/atoms/Card";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Notification from "@reearth-cms/components/atoms/Notification";
import Space from "@reearth-cms/components/atoms/Space";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import ExperimentIcon from "@reearth-cms/components/molecules/ExperimentIcon";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { ImportContentUtils } from "@reearth-cms/utils/importContent";
import { ImportSchemaUtils } from "@reearth-cms/utils/importSchema";
import { AntdToken } from "@reearth-cms/utils/style";

export type Props = {
  model: Model;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  hasSchemaCreateRight: boolean;
  hasContentCreateRight: boolean;
  exportLoading?: boolean;
  onSchemaNavigate: (modelId: string) => void;
  onImportSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
  onImportContentNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
  onModelExport: (modelId?: string, format?: ExportFormat) => Promise<void>;
};

const ModelCard: React.FC<Props> = ({
  model,
  hasUpdateRight,
  hasDeleteRight,
  hasSchemaCreateRight,
  hasContentCreateRight,
  exportLoading,
  onSchemaNavigate,
  onImportSchemaNavigate,
  onContentNavigate,
  onImportContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
  onModelExport,
}) => {
  const t = useT();

  const { Meta } = Card;

  const hasModelFields = useMemo<boolean>(
    () => model.schema.fields.length > 0,
    [model.schema.fields],
  );

  const handleCSVExport = useCallback(
    async (exportType: ExportFormat) => {
      const key = `csv-export-${Date.now()}`;
      Notification.open({
        key,
        type: "warning",
        message: t("Export as CSV"),
        description: (
          <ModalContent>
            <span>{t("CSV export only supports simple fields (text, number, date).")}</span>
            <span>{t("Relations, arrays, objects, and geometry fields are not included.")}</span>
            <span>
              {t("For a complete export with all fields, please use the JSON export option.")}
            </span>
          </ModalContent>
        ),
        btn: (
          <Space>
            <Button onClick={() => Notification.destroy(key)}>{t("Cancel")}</Button>
            <Button
              type="primary"
              onClick={async () => {
                Notification.destroy(key);
                await onModelExport(model.id, exportType);
              }}>
              {t("Export CSV")}
            </Button>
          </Space>
        ),
        duration: 0,
      });
    },
    [model.id, onModelExport, t],
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
        Notification.error({
          message: t("Cannot export GeoJSON"),
          description: t(
            "No Geometry field was found in this model, so GeoJSON export is not available.",
          ),
          duration: 0,
        });
      } else if (geoFieldsCount > 1) {
        const key = `geojson-export-${Date.now()}`;
        Notification.open({
          key,
          type: "warning",
          message: t("Multiple Geometry fields detected"),
          description: (
            <ModalContent>
              <span>{t("This model has multiple Geometry fields.")}</span>
              <span>{t("GeoJSON format supports only one geometry field.")}</span>
              <span>
                {t(
                  "Only the first Geometry field will be exported. Please adjust your data if needed.",
                )}
              </span>
            </ModalContent>
          ),
          btn: (
            <Space>
              <Button onClick={() => Notification.destroy(key)}>{t("Cancel")}</Button>
              <Button
                type="primary"
                onClick={async () => {
                  Notification.destroy(key);
                  await onModelExport(model.id, exportType);
                }}>
                {t("Export Anyway")}
              </Button>
            </Space>
          ),
          duration: 0,
        });
      } else {
        await onModelExport(model.id, exportType);
      }
    },
    [getGeometryFieldsCount, model.id, onModelExport, t],
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
    () => ImportSchemaUtils.getUIMetadata({ hasSchemaCreateRight, hasModelFields }),
    [hasModelFields, hasSchemaCreateRight],
  );
  const getImportContentUIMetadata = useMemo(
    () => ImportContentUtils.getUIMetadata({ hasContentCreateRight, hasModelFields }),
    [hasContentCreateRight, hasModelFields],
  );

  const ImportMenuItems = useMemo<MenuProps[]>(
    () => [
      {
        key: "schema",
        label: (
          <Tooltip title={getImportSchemaUIMetadata.tooltipMessage}>{t("Import Schema")}</Tooltip>
        ),
        disabled: getImportSchemaUIMetadata.shouldDisable,
        onClick: () => onImportSchemaNavigate(model.id),
        "data-testid": DATA_TEST_ID.ModelCard__MiscImportSchema,
      },
      {
        key: "content",
        label: (
          <Tooltip title={getImportContentUIMetadata.tooltipMessage}>{t("Import content")}</Tooltip>
        ),
        disabled: getImportContentUIMetadata.shouldDisable,
        onClick: () => onImportContentNavigate(model.id),
        "data-testid": DATA_TEST_ID.ModelCard__MiscImportContent,
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

  const ExportMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "schema",
        label: t("Export Schema"),
        onClick: () => handleModelExportClick(ExportFormat.Schema),
        disabled: exportLoading,
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportSchema,
      },
      {
        key: "content",
        label: t("Export content"),
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContent,
        children: [
          {
            key: "json",
            label: t("JSON"),
            onClick: () => handleModelExportClick(ExportFormat.Json),
            disabled: exportLoading,
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentJSON,
          },
          {
            key: "csv",
            label: t("CSV"),
            onClick: () => handleModelExportClick(ExportFormat.Csv),
            disabled: exportLoading,
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentCSV,
          },
          {
            key: "geojson",
            label: t("GeoJSON"),
            onClick: () => handleModelExportClick(ExportFormat.Geojson),
            disabled: exportLoading,
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentGeoJSON,
          },
        ],
      },
    ],
    [t, handleModelExportClick, exportLoading],
  );

  const MiscMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
        disabled: !hasUpdateRight,
        "data-testid": DATA_TEST_ID.ModelCard__MiscEdit,
      },
      {
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
        danger: true,
        disabled: !hasDeleteRight,
        "data-testid": DATA_TEST_ID.ModelCard__MiscDelete,
      },
    ],
    [t, hasUpdateRight, hasDeleteRight, onModelUpdateModalOpen, model, onModelDeletionModalOpen],
  );

  const FileOperationMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "import",
        label: t("Import"),
        icon: <StyledExperimentIcon />,
        children: ImportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationImport,
      },
      {
        key: "export",
        label: t("Export"),
        children: ExportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationExport,
      },
    ],
    [t, ImportMenuItems, ExportMenuItems],
  );

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate(model.id)} />,
        <Dropdown key="fileOperation" menu={{ items: FileOperationMenuItems }} trigger={["click"]}>
          <a
            data-testid={DATA_TEST_ID.ModelCard__FileOperationIcon}
            onClick={e => e.preventDefault()}>
            <Icon icon="download" />
          </a>
        </Dropdown>,
        <Dropdown key="misc" menu={{ items: MiscMenuItems }} trigger={["click"]}>
          <a data-testid={DATA_TEST_ID.ModelCard__MiscIcon} onClick={e => e.preventDefault()}>
            <Icon icon="ellipsis" />
          </a>
        </Dropdown>,
      ]}>
      <Meta title={model.name} description={model.description} />
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

const ModalContent = styled.p``;

const StyledExperimentIcon = styled(ExperimentIcon)`
  margin-right: ${AntdToken.SPACING.XS}px;
`;
