import ReadmeMolecule from "@reearth-cms/components/molecules/Readme";

import useHooks from "./hooks";

const Readme: React.FC = () => {
  const {
    readmeValue,
    projectReadme,
    readmeEditMode,
    hasUpdateRight,
    handleProjectUpdate,
    handleReadmeSave,
    handleReadmeEdit,
    handleReadmeMarkdownChange,
  } = useHooks();

  return (
    <ReadmeMolecule
      readmeValue={readmeValue}
      projectReadme={projectReadme}
      readmeEditMode={readmeEditMode}
      hasUpdateRight={hasUpdateRight}
      onProjectUpdate={handleProjectUpdate}
      onReadmeSave={handleReadmeSave}
      onReadmeEdit={handleReadmeEdit}
      onReadmeMarkdownChange={handleReadmeMarkdownChange}
    />
  );
};

export default Readme;
