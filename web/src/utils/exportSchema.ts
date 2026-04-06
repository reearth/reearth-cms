import { TooltipProps } from "@reearth-cms/components/atoms/Tooltip";
import { t } from "@reearth-cms/i18n";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class ExportSchemaUtils {
  public static getUIMetadata(params: { isExportLoading: boolean; hasModelFields?: boolean }): {
    tooltipMessage: TooltipProps["title"];
    shouldDisable: boolean;
  } {
    const { isExportLoading, hasModelFields } = params;

    if (isExportLoading) return { shouldDisable: true, tooltipMessage: undefined };

    return hasModelFields
      ? { shouldDisable: false, tooltipMessage: undefined }
      : {
          shouldDisable: true,
          tooltipMessage: t("Empty schemas cannot be exported"),
        };
  }
}
