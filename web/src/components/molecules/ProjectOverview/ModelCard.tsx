import styled from "@emotion/styled";
import { useMemo } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import ExperimentIcon from "@reearth-cms/components/molecules/ExperimentIcon";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { ExportContentUtils } from "@reearth-cms/utils/exportContent";
import { ExportSchemaUtils } from "@reearth-cms/utils/exportSchema";
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
  onModelExport: (
    modelId?: string,
    format?: ExportFormat,
    geometryFieldsCount?: number,
  ) => Promise<void>;
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

  const getGeometryFieldsCount = useMemo(
    () =>
      model.schema?.fields?.filter(
        field =>
          field.type === SchemaFieldType.GeometryEditor ||
          field.type === SchemaFieldType.GeometryObject,
      ).length ?? 0,
    [model.schema?.fields],
  );

  const getImportSchemaUIMetadata = useMemo(
    () => ImportSchemaUtils.getUIMetadata({ hasSchemaCreateRight, hasModelFields }),
    [hasModelFields, hasSchemaCreateRight],
  );
  const getImportContentUIMetadata = useMemo(
    () => ImportContentUtils.getUIMetadata({ hasContentCreateRight, hasModelFields }),
    [hasContentCreateRight, hasModelFields],
  );

  const getExportSchemaUIMetadata = useMemo(
    () =>
      ExportSchemaUtils.getUIMetadata({ hasModelFields, isExportLoading: exportLoading || false }),
    [exportLoading, hasModelFields],
  );

  const getExportContentUIMetadata = useMemo(
    () => ExportContentUtils.getUIMetadata({ isExportLoading: exportLoading || false }),
    [exportLoading],
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
        key: t("Export Schema"),
        label: (
          <Tooltip title={getExportSchemaUIMetadata.tooltipMessage}>
            {exportLoading && <StyledInlineIcon icon="loading" />}
            <span>{t("Export Schema")}</span>
          </Tooltip>
        ),
        onClick: () => onModelExport(model.id, ExportFormat.Schema),
        disabled: getExportSchemaUIMetadata.shouldDisable,
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportSchema,
      },
      {
        key: "content",
        label: (
          <Tooltip title={getExportContentUIMetadata.tooltipMessage}>
            {exportLoading && <StyledInlineIcon icon="loading" />}
            <span>{t("Export content")}</span>
          </Tooltip>
        ),
        "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContent,
        disabled: getExportContentUIMetadata.shouldDisable,
        children: [
          {
            key: t("JSON"),
            label: t("JSON"),
            onClick: () => onModelExport(model.id, ExportFormat.Json),
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentJSON,
          },
          {
            key: t("CSV"),
            label: t("CSV"),
            onClick: () => onModelExport(model.id, ExportFormat.Csv),
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentCSV,
          },
          {
            key: t("GeoJSON"),
            label: t("GeoJSON"),
            onClick: () => onModelExport(model.id, ExportFormat.Geojson, getGeometryFieldsCount),
            "data-testid": DATA_TEST_ID.ModelCard__FileOperationExportContentGeoJSON,
          },
        ],
      },
    ],
    [
      t,
      getExportSchemaUIMetadata.tooltipMessage,
      getExportSchemaUIMetadata.shouldDisable,
      exportLoading,
      getExportContentUIMetadata.tooltipMessage,
      getExportContentUIMetadata.shouldDisable,
      onModelExport,
      model.id,
      getGeometryFieldsCount,
    ],
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

const StyledExperimentIcon = styled(ExperimentIcon)`
  margin-right: ${AntdToken.SPACING.XS}px;
`;

const StyledInlineIcon = styled(Icon)`
  margin-right: ${AntdToken.SPACING.XS}px;
`;
