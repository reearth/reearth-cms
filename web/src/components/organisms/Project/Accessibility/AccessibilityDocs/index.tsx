import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ApiDocs from "@reearth-cms/components/molecules/ApiDocs";

import useHooks from "./hooks";

const AccessibilityDocs: React.FC = () => {
  const { specUrl } = useHooks();

  return (
    <InnerContent isFullHeight>
      <ApiDocs specUrl={specUrl} />
    </InnerContent>
  );
};

export default AccessibilityDocs;
