import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const { projectScope, models, handleAccessibilityUpdate } = useHooks();

  return (
    <AccessibilityMolecule
      projectScope={projectScope}
      models={models}
      onAccessibilityUpdate={handleAccessibilityUpdate}
    />
  );
};

export default Accessibility;
