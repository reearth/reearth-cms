import Status from "@reearth-cms/components/atoms/Status";
import { ArchiveExtractionStatus as ArchiveExtractionStatusType } from "@reearth-cms/components/molecules/Asset/asset.type";

import useHooks from "./hooks";

type Props = {
  archiveExtractionStatus: ArchiveExtractionStatusType;
};

const ArchiveExtractionStatus: React.FC<Props> = ({ archiveExtractionStatus }) => {
  const { status, statusColor } = useHooks(archiveExtractionStatus);

  return <Status status={status} color={statusColor} />;
};

export default ArchiveExtractionStatus;
