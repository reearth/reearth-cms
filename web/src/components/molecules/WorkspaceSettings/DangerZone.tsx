import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasDeleteRight: boolean;
  onWorkspaceDelete: () => Promise<void>;
};

const DangerZone: React.FC<Props> = ({ hasDeleteRight, onWorkspaceDelete }) => {
  const t = useT();
  const { confirm } = useModal();

  const handleWorkspaceDeleteConfirmation = useCallback(() => {
    confirm({
      title: t("Are you sure you want to delete this workspace?"),
      async onOk() {
        await onWorkspaceDelete();
      },
    });
  }, [confirm, onWorkspaceDelete, t]);

  return (
    <ContentSection title={t("Danger Zone")} danger>
      <Title>{t("Remove Workspace")}</Title>
      <Text>
        {t(
          "Permanently removes the current workspace and all of its contents from Re:Earth CMS. This action is not reversible, so please continue with caution.",
        )}
      </Text>
      <RemoveButton
        onClick={handleWorkspaceDeleteConfirmation}
        type="primary"
        danger
        disabled={!hasDeleteRight}>
        {t("Remove Workspace")}
      </RemoveButton>
    </ContentSection>
  );
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
  margin: 24px 0;
`;

const RemoveButton = styled(Button)`
  width: fit-content;
`;
