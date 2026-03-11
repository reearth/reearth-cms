import { useEffect, useState } from "react";

import { ArchiveExtractionStatus } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/style";

export default (archiveExtractionStatus: ArchiveExtractionStatus) => {
  const t = useT();

  const [status, setStatus] = useState<string>("");
  const [statusColor, setStatusColor] = useState<string>("");

  const DECOMPRESSED = t("Decompressed");
  const FAILED = t("Failed");
  const DECOMPRESSING = t("Decompressing");
  const SKIPPED = t("Skipped");
  const PENDING = t("Pending");

  useEffect(() => {
    switch (archiveExtractionStatus) {
      case "DONE":
        setStatusColor(AntdColor.GREEN.GREEN_5);
        setStatus(DECOMPRESSED);
        break;
      case "FAILED":
        setStatusColor(AntdColor.RED.RED_5);
        setStatus(FAILED);
        break;
      case "IN_PROGRESS":
        setStatusColor(AntdColor.ORANGE.ORANGE_5);
        setStatus(DECOMPRESSING);
        break;
      case "SKIPPED":
        setStatusColor(AntdColor.GREY.GREY_0); // originally #BFBFBF
        setStatus(SKIPPED);
        break;
      case "PENDING":
        setStatusColor(AntdColor.GREY.GREY_0); // originally #BFBFBF
        setStatus(PENDING);
        break;
      default:
        setStatusColor("");
        setStatus("");
        break;
    }
  }, [DECOMPRESSED, DECOMPRESSING, FAILED, SKIPPED, PENDING, archiveExtractionStatus, t]);

  return { status, statusColor };
};
