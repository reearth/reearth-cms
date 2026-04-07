import { useMutation } from "@apollo/client/react";
import fileDownload from "js-file-download";
import { useCallback } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ExportModelSchemaDocument } from "@reearth-cms/gql/__generated__/model.generated";
import { useT } from "@reearth-cms/i18n";
import { useExportSchemaLoading } from "@reearth-cms/state";

export const useExportSchema = () => {
  const t = useT();
  const [exportSchemaLoading, setExportSchemaLoading] = useExportSchemaLoading();
  const [exportModelSchema] = useMutation(ExportModelSchemaDocument);

  const handleExportSchema = useCallback(
    async (modelId: string) => {
      setExportSchemaLoading(true);
      try {
        const res = await exportModelSchema({ variables: { modelId } });
        if (res.error || !res.data?.exportModelSchema) {
          throw new Error(t("Failed to export schema."));
        }
        const url = res.data.exportModelSchema.url;
        const filename = `${modelId}-schema.json`;
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to download ${filename}`);
        }
        const blob = await response.blob();
        fileDownload(blob, filename);
        Notification.success({
          message: t("Download successful"),
          description: filename,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Export error:", errorMessage);
        Notification.error({
          message: t("Export failed"),
          description: errorMessage,
        });
      } finally {
        setExportSchemaLoading(false);
      }
    },
    [exportModelSchema, setExportSchemaLoading, t],
  );

  return { handleExportSchema, exportSchemaLoading };
};
