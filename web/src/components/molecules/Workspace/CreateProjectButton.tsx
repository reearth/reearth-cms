import { useState, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProjectCreationModal, {
  FormValues,
} from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  privateProjectsAllowed?: boolean;
  hasCreateRight: boolean;
  onProjectCreate: (values: FormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const CreateProjectButton: React.FC<Props> = ({
  privateProjectsAllowed,
  hasCreateRight,
  onProjectCreate,
  onProjectAliasCheck,
}) => {
  const t = useT();
  const [projectModalShown, setProjectModalShown] = useState(false);

  const handleProjectModalOpen = useCallback(() => setProjectModalShown(true), []);

  const handleProjectModalClose = useCallback(() => {
    setProjectModalShown(false);
  }, []);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        await onProjectCreate(values);
        setProjectModalShown(false);
      } catch (e) {
        console.error(e);
      }
    },
    [onProjectCreate],
  );

  return (
    <>
      <Button
        onClick={handleProjectModalOpen}
        type="primary"
        icon={<Icon icon="plus" />}
        disabled={!hasCreateRight}
        data-testid="workspace-new-project-button">
        {t("New Project")}
      </Button>
      <ProjectCreationModal
        privateProjectsAllowed={privateProjectsAllowed}
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleSubmit}
        onProjectAliasCheck={onProjectAliasCheck}
      />
    </>
  );
};

export default CreateProjectButton;
