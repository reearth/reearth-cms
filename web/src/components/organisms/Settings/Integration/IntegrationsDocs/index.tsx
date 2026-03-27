import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ApiDocs from "@reearth-cms/components/molecules/ApiDocs";

import useHooks from "./hooks";

const IntegrationsDocs: React.FC = () => {
  const { specContent, specUrl } = useHooks();

  return (
    <InnerContent isFullHeight>
      <ApiDocs specContent={specContent} specUrl={specUrl} />
    </InnerContent>
  );
};

export default IntegrationsDocs;
