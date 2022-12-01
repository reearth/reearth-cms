import { useEffect, useState } from "react";

import { ArchiveExtractionStatus } from "../asset.type";

export default (archiveExtractionStatus: ArchiveExtractionStatus) => {
  const [status, setStatus] = useState<string>("");
  const [statusColor, setStatusColor] = useState<string>("");

  const red = "#F5222D";
  const orange = "#FA8C16";
  const green = "#52C41A";

  useEffect(() => {
    switch (archiveExtractionStatus) {
      case "done":
        setStatusColor(green);
        setStatus("Decompressed");
        break;
      case "failed":
        setStatusColor(red);
        setStatus("Failed");
        break;
      case "in_progress":
        setStatusColor(orange);
        setStatus("Decompressing");
        break;
      case "pending":
      default:
        setStatusColor("");
        setStatus("");
        break;
    }
  }, [archiveExtractionStatus]);

  return { status, statusColor };
};
