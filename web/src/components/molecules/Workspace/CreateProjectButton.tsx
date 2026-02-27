import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProjectCreationModal, {
  FormValues,
} from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasCreateRight: boolean;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectCreate: (values: FormValues) => Promise<void>;
  privateProjectsAllowed?: boolean;
};

const CreateProjectButton: React.FC<Props> = ({
  hasCreateRight,
  onProjectAliasCheck,
  onProjectCreate,
  privateProjectsAllowed,
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
        disabled={!hasCreateRight}
        icon={<Icon icon="plus" />}
        onClick={handleProjectModalOpen}
        type="primary">
        {t("New Project")}
      </Button>
      <ProjectCreationModal
        onClose={handleProjectModalClose}
        onProjectAliasCheck={onProjectAliasCheck}
        onSubmit={handleSubmit}
        open={projectModalShown}
        privateProjectsAllowed={privateProjectsAllowed}
      />
    </>
  );
};

export default CreateProjectButton;
