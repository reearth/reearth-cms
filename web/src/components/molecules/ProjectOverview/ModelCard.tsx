import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  model: Model;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  exportLoading?: boolean;
  onSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
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
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
  onModelExport,
}) => {
  const t = useT();
  const { confirm, error } = useModal();

  const { Meta } = Card;

  const OptionsMenuItems = useMemo(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
        disabled: !hasUpdateRight,
      },
      {
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
        danger: true,
        disabled: !hasDeleteRight,
      },
    ],
    [t, hasUpdateRight, hasDeleteRight, onModelUpdateModalOpen, model, onModelDeletionModalOpen],
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
              <div>{t("GeoJSON format supports only one geometry field. ")}</div>
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

  const ExportMenuItems = useMemo(
    () => [
      {
        key: "schema",
        label: t("Export Schema"),
        onClick: () => handleModelExportClick(ExportFormat.Schema),
        disabled: exportLoading,
      },
      {
        key: "json",
        label: t("Export as JSON"),
        onClick: () => handleModelExportClick(ExportFormat.Json),
        disabled: exportLoading,
      },
      {
        key: "csv",
        label: t("Export as CSV"),
        onClick: () => handleModelExportClick(ExportFormat.Csv),
        disabled: exportLoading,
      },
      {
        key: "geojson",
        label: t("Export as GeoJSON"),
        onClick: () => handleModelExportClick(ExportFormat.Geojson),
        disabled: exportLoading,
      },
    ],
    [t, handleModelExportClick, exportLoading],
  );

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate(model.id)} />,
        <Dropdown key="export" menu={{ items: ExportMenuItems }} trigger={["click"]}>
          <a onClick={e => e.preventDefault()}>
            <Icon icon="download" />
          </a>
        </Dropdown>,
        <Dropdown key="options" menu={{ items: OptionsMenuItems }} trigger={["click"]}>
          <a onClick={e => e.preventDefault()}>
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
