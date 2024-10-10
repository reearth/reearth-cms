import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    form,
    models,
    modelsState,
    assetState,
    isSaveDisabled,
    loading,
    apiUrl,
    handleValuesChange,
    handlePublicUpdate,
  } = useHooks();

  return (
    <AccessibilityMolecule
      form={form}
      models={models}
      modelsState={modelsState}
      assetState={assetState}
      isSaveDisabled={isSaveDisabled}
      loading={loading}
      apiUrl={apiUrl}
      handleValuesChange={handleValuesChange}
      handlePublicUpdate={handlePublicUpdate}
    />
  );
};

export default Accessibility;
