import APIKeyDetailsMolecule from "@reearth-cms/components/molecules/Accessibility/APIKeyDetails";

import useHooks from "./hooks";

const APIKeyDetails: React.FC = () => {
    const {
    keyId,
    } = useHooks();

  return <APIKeyDetailsMolecule keyId={keyId} />;
};

export default APIKeyDetails;
