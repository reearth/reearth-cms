import Status from "@reearth-cms/components/atoms/Status";

import { ArchiveExtractionStatus as ArchiveExtractionStatusType } from "../asset.type";

import useHooks from "./hooks";

type Props = {
  archiveExtractionStatus: ArchiveExtractionStatusType;
};

const ArchiveExtractionStatus: React.FC<Props> = ({ archiveExtractionStatus }) => {
  const { status, statusColor } = useHooks(archiveExtractionStatus);

  return <Status status={status} color={statusColor} />;
};

export default ArchiveExtractionStatus;
