import { TooltipProps } from "@reearth-cms/components/atoms/Tooltip";
import { t } from "@reearth-cms/i18n";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class ExportContentUtils {
  public static getUIMetadata(params: { isExportLoading: boolean; hasContent?: boolean }): {
    tooltipMessage: TooltipProps["title"];
    shouldDisable: boolean;
  } {
    const { isExportLoading, hasContent = true } = params;

    if (isExportLoading) return { shouldDisable: true, tooltipMessage: undefined };

    return hasContent
      ? { shouldDisable: false, tooltipMessage: undefined }
      : {
          shouldDisable: true,
          tooltipMessage: t("Empty content cannot be exported"),
        };
  }
}
