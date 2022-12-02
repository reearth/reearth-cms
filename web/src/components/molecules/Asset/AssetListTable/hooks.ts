import { useEffect, useState } from "react";

import { ArchiveExtractionStatus } from "@reearth-cms/components/molecules/Asset/asset.type";
import { useT } from "@reearth-cms/i18n";

export default (archiveExtractionStatus: ArchiveExtractionStatus) => {
  const t = useT();

  const [status, setStatus] = useState<string>("");
  const [statusColor, setStatusColor] = useState<string>("");

  const RED = "#F5222D";
  const ORANGE = "#FA8C16";
  const GREEN = "#52C41A";

  const DECOMPRESSED = t("Decompressed");
  const FAILED = t("Failed");
  const DECOMPRESSING = t("Decompressing");

  useEffect(() => {
    switch (archiveExtractionStatus) {
      case "done":
        setStatusColor(GREEN);
        setStatus(DECOMPRESSED);
        break;
      case "failed":
        setStatusColor(RED);
        setStatus(FAILED);
        break;
      case "in_progress":
        setStatusColor(ORANGE);
        setStatus(DECOMPRESSING);
        break;
      case "pending":
      default:
        setStatusColor("");
        setStatus("");
        break;
    }
  }, [DECOMPRESSED, DECOMPRESSING, FAILED, archiveExtractionStatus, t]);

  return { status, statusColor };
};
