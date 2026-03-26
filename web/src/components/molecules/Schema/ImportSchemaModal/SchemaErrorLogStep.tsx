import ImportErrorLogView from "@reearth-cms/components/molecules/Common/ImportErrorLogView";
import { ErrorLogMeta } from "@reearth-cms/utils/importErrorLog";

type Props = {
  errorLogMeta: ErrorLogMeta | null;
};

const SchemaErrorLogStep: React.FC<Props> = ({ errorLogMeta }) => {
  return <ImportErrorLogView errorLogMeta={errorLogMeta} source="schema" />;
};

export default SchemaErrorLogStep;
