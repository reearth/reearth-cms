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
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

export type Props = {
  model: Model;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
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
  const { confirm, error } = useModal();

  const { Meta } = Card;

  const hasModelFields = useMemo<boolean>(
    () => model.schema.fields.length > 0,
    [model.schema.fields],
  );

  const handleCSVExport = useCallback(
    async (exportType: ExportFormat) => {
      confirm({
        width: 550,
        title: t("Export as CSV"),
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
          title: t("Cannot export GeoJSON"),
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
        });
      } else if (geoFieldsCount > 1) {
        confirm({
          width: 550,
          title: t("Multiple Geometry fields detected"),
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

  const ImportMenuItems = useMemo<MenuProps[]>(
    () => [
      {
        key: "schema",
        label: hasModelFields ? (
          <Tooltip title={t("Only empty schemas can be imported into")}>
            {t("Import Schema")}
          </Tooltip>
        ) : (
          t("Import Schema")
        ),
        disabled: hasModelFields,
        onClick: () => onImportSchemaNavigate(model.id),
        "data-testid": DATA_TEST_ID.ModelCard_UtilDropdownImportSchema,
      },
      {
        key: "content",
        label: hasModelFields ? (
          t("Import content")
        ) : (
          <Tooltip title={t("Please create a schema first")}>{t("Import content")}</Tooltip>
        ),
        disabled: !hasModelFields,
        onClick: () => onImportContentNavigate(model.id),
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownImportContent,
      },
    ],
    [hasModelFields, model.id, onImportContentNavigate, onImportSchemaNavigate, t],
  );

  const ExportMenuItems = useMemo<MenuProps[]>(
    () => [
      {
        key: "schema",
        label: t("Export Schema"),
        onClick: () => handleModelExportClick(ExportFormat.Schema),
        disabled: exportLoading,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportSchema,
      },
      {
        key: "json",
        label: t("Export as JSON"),
        onClick: () => handleModelExportClick(ExportFormat.Json),
        disabled: exportLoading,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentJSON,
      },
      {
        key: "csv",
        label: t("Export as CSV"),
        onClick: () => handleModelExportClick(ExportFormat.Csv),
        disabled: exportLoading,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentCSV,
      },
      {
        key: "geojson",
        label: t("Export as GeoJSON"),
        onClick: () => handleModelExportClick(ExportFormat.Geojson),
        disabled: exportLoading,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON,
      },
    ],
    [t, handleModelExportClick, exportLoading],
  );

  const OptionsMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
        disabled: !hasUpdateRight,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownEdit,
      },
      {
        key: "import",
        label: t("Import"),
        children: ImportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownImport,
      },
      {
        key: "export",
        label: t("Export"),
        children: ExportMenuItems,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownExport,
      },
      {
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
        danger: true,
        disabled: !hasDeleteRight,
        "data-testid": DATA_TEST_ID.ModelCard__UtilDropdownDelete,
      },
    ],
    [
      t,
      hasUpdateRight,
      hasDeleteRight,
      onModelUpdateModalOpen,
      model,
      onModelDeletionModalOpen,
      ImportMenuItems,
      ExportMenuItems,
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

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
