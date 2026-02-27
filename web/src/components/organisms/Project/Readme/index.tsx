import ReadmeMolecule from "@reearth-cms/components/molecules/Readme";

import useHooks from "./hooks";

const Readme: React.FC = () => {
  const {
    handleProjectUpdate,
    handleReadmeEdit,
    handleReadmeMarkdownChange,
    handleReadmeSave,
    hasUpdateRight,
    projectReadme,
    readmeEditMode,
    readmeValue,
  } = useHooks();

  return (
    <ReadmeMolecule
      hasUpdateRight={hasUpdateRight}
      onProjectUpdate={handleProjectUpdate}
      onReadmeEdit={handleReadmeEdit}
      onReadmeMarkdownChange={handleReadmeMarkdownChange}
      onReadmeSave={handleReadmeSave}
      projectReadme={projectReadme}
      readmeEditMode={readmeEditMode}
      readmeValue={readmeValue}
    />
  );
};

export default Readme;
