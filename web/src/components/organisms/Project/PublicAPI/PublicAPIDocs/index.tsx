import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ApiDocs from "@reearth-cms/components/molecules/ApiDocs";

import usePublicApiUrl from "../usePublicApiUrl";

const PublicAPIDocs: React.FC = () => {
  const specUrl = usePublicApiUrl();

  return (
    <InnerContent isFullHeight>
      <ApiDocs specUrl={specUrl} />
    </InnerContent>
  );
};

export default PublicAPIDocs;
