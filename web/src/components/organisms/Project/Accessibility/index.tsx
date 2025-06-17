import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    initialValues,
    models,
    hasPublishRight,
    updateLoading,
    regenerateLoading,
    apiUrl,
    alias,
    token,
    handlePublicUpdate,
    handleRegenerateToken,
  } = useHooks();

  return (
    <AccessibilityMolecule
      initialValues={initialValues}
      models={models}
      hasPublishRight={hasPublishRight}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      apiUrl={apiUrl}
      alias={alias}
      token={token}
      onPublicUpdate={handlePublicUpdate}
      onRegenerateToken={handleRegenerateToken}
    />
  );
};

export default Accessibility;
