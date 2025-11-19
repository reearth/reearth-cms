import { useState, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import WorkspaceCreationModal, {
  FormValues as WorkspaceFormValues,
} from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
};

const CreateWorkspaceButton: React.FC<Props> = ({ onWorkspaceCreate }) => {
  const t = useT();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalShown(true), []);

  const handleWorkspaceModalClose = useCallback(() => {
    setWorkspaceModalShown(false);
  }, []);

  return (
    <>
      <Button onClick={handleWorkspaceModalOpen}>{t("Create a Workspace")}</Button>
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={onWorkspaceCreate}
      />
    </>
  );
};

export default CreateWorkspaceButton;
