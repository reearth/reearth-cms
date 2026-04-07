import { useMutation } from "@apollo/client/react";
import fileDownload from "js-file-download";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Notification from "@reearth-cms/components/atoms/Notification";
import Space from "@reearth-cms/components/atoms/Space";
import { ExportFormat } from "@reearth-cms/components/molecules/Model/types";
import { ExportFormat as GQLExportFormat } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ExportModelDocument } from "@reearth-cms/gql/__generated__/model.generated";
import { useT } from "@reearth-cms/i18n";
import { useExportContentLoading } from "@reearth-cms/state";

const getFilenameFromFormat = (modelId: string, format: ExportFormat): string => {
  switch (format) {
    case ExportFormat.Json:
      return `${modelId}-data.json`;
    case ExportFormat.Csv:
      return `${modelId}-data.csv`;
    case ExportFormat.Geojson:
      return `${modelId}-data.geojson`;
    default:
      return `${modelId}-data.json`;
  }
};

const exportFormatToGQL: Record<
  ExportFormat.Csv | ExportFormat.Geojson | ExportFormat.Json,
  GQLExportFormat
> = {
  [ExportFormat.Csv]: GQLExportFormat.Csv,
  [ExportFormat.Geojson]: GQLExportFormat.Geojson,
  [ExportFormat.Json]: GQLExportFormat.Json,
};

export const useExportContent = () => {
  const t = useT();
  const [exportContentLoading, setExportContentLoading] = useExportContentLoading();
  const [exportModel] = useMutation(ExportModelDocument);

  const handleExportContent = useCallback(
    async (modelId: string, format: ExportFormat) => {
      setExportContentLoading(true);

      try {
        const exportFormat =
          exportFormatToGQL[format as ExportFormat.Csv | ExportFormat.Geojson | ExportFormat.Json];
        const res = await exportModel({
          variables: { modelId, format: exportFormat },
        });

        if (res.error || !res.data?.exportModel) {
          throw new Error(t("Failed to export model data."));
        }

        const url = res.data.exportModel.url;
        const filename = getFilenameFromFormat(modelId, format);
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to download ${filename}`);
        }
        const blob = await response.blob();
        fileDownload(blob, filename);

        Notification.success({ message: t("Download successful"), description: filename });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Export error:", errorMessage);

        Notification.error({ message: t("Export failed"), description: errorMessage });
      } finally {
        setExportContentLoading(false);
      }
    },
    [exportModel, setExportContentLoading, t],
  );

  const handleContentExportClick = useCallback(
    async (modelId: string, format: ExportFormat, geometryFieldsCount = 0) => {
      if (!modelId) {
        Notification.error({
          message: t("Export failed"),
          description: t("No model selected."),
        });
        return;
      }

      switch (format) {
        case ExportFormat.Csv: {
          const key = `csv-export-${Date.now()}`;

          Notification.open({
            key,
            type: "warning",
            message: t("Export as CSV"),
            description: (
              <p>
                <span>{t("CSV export only supports simple fields (text, number, date).")}</span>
                <span>
                  {t("Relations, arrays, objects, and geometry fields are not included.")}
                </span>
                <span>
                  {t("For a complete export with all fields, please use the JSON export option.")}
                </span>
              </p>
            ),
            btn: (
              <Space>
                <Button onClick={() => Notification.destroy(key)}>{t("Cancel")}</Button>
                <Button
                  type="primary"
                  onClick={async () => {
                    Notification.destroy(key);
                    await handleExportContent(modelId, format);
                  }}>
                  {t("Export CSV")}
                </Button>
              </Space>
            ),
            duration: 0,
          });
          break;
        }
        case ExportFormat.Geojson: {
          if (geometryFieldsCount === 0) {
            Notification.error({
              message: t("Cannot export GeoJSON"),
              description: t(
                "No Geometry field was found in this model, so GeoJSON export is not available.",
              ),
              duration: 0,
            });
          } else if (geometryFieldsCount > 1) {
            const key = `geojson-export-${Date.now()}`;

            Notification.open({
              key,
              type: "warning",
              message: t("Multiple Geometry fields detected"),
              description: (
                <p>
                  <span>{t("This model has multiple Geometry fields.")}</span>
                  <span>{t("GeoJSON format supports only one geometry field.")}</span>
                  <span>
                    {t(
                      "Only the first Geometry field will be exported. Please adjust your data if needed.",
                    )}
                  </span>
                </p>
              ),
              btn: (
                <Space>
                  <Button onClick={() => Notification.destroy(key)}>{t("Cancel")}</Button>
                  <Button
                    type="primary"
                    onClick={async () => {
                      Notification.destroy(key);
                      await handleExportContent(modelId, format);
                    }}>
                    {t("Export Anyway")}
                  </Button>
                </Space>
              ),
              duration: 0,
            });
          } else {
            await handleExportContent(modelId, format);
          }
          break;
        }
        default:
          await handleExportContent(modelId, format);
          break;
      }
    },
    [handleExportContent, t],
  );

  return { handleContentExportClick, exportContentLoading };
};
