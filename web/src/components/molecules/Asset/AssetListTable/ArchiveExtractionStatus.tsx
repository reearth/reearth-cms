import Badge from "@reearth-cms/components/atoms/Badge";
import { ArchiveExtractionStatus as ArchiveExtractionStatusType } from "@reearth-cms/components/molecules/Asset/types";

import useHooks from "./hooks";

interface Props {
  archiveExtractionStatus: ArchiveExtractionStatusType;
}

const ArchiveExtractionStatus: React.FC<Props> = ({ archiveExtractionStatus }) => {
  const { status, statusColor } = useHooks(archiveExtractionStatus);

  return <Badge color={statusColor} text={status} />;
};

export default ArchiveExtractionStatus;
