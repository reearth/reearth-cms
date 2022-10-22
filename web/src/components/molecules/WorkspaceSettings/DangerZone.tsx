import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  onWorkspaceDelete: () => Promise<void>;
};

const DangerZone: React.FC<Props> = ({ onWorkspaceDelete }) => {
  const t = useT();
  const { confirm } = Modal;

  const handleWorkspaceDeleteConfirmation = useCallback(() => {
    confirm({
      title: t("Are you sure you want to delete this workspace?"),
      icon: <Icon icon="exclamationCircle" />,
      onOk() {
        onWorkspaceDelete();
      },
    });
  }, [confirm, onWorkspaceDelete, t]);

  return (
    <>
      <Title>{t("Remove Workspace")}</Title>
      <Text>
        {t(
          "Because at the current level of development, service A and service B are interdependent, and the workspace and personal accounts will be synchronized.",
        )}
        <br />
        {t(
          "So when you delete or create a workspace in service A and service B, they will all be synchronized with each other. Make sure you understand what you're doing.",
        )}
      </Text>

      <Button onClick={handleWorkspaceDeleteConfirmation} type="primary" danger>
        {t("Remove Workspace")}
      </Button>
    </>
  );
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #ff4d4f;
  margin: 24px 0;
`;
