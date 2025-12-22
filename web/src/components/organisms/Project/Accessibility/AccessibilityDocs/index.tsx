import ApiDocs from "@reearth-cms/components/molecules/ApiDocs";

import useHooks from "./hooks";

const AccessibilityDocs: React.FC = () => {
  const { specUrl } = useHooks();

  return <ApiDocs specUrl={specUrl} />;
};

export default AccessibilityDocs;
