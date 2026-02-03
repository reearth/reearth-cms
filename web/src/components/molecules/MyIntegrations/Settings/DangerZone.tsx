import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

type Props = {
  onIntegrationDelete: () => Promise<void>;
};

const DangerZone: React.FC<Props> = ({ onIntegrationDelete }) => {
  const t = useT();
  const { confirm } = useModal();

  const handleWorkspaceDeleteConfirmation = useCallback(() => {
    confirm({
      title: t("Are you sure to remove this integration?"),
      content: (
        <>
          {t("Permanently remove your Integration and all of its contents from the Re:Earth CMS.")}
          <br />
          {t("Once the integration is removed, it will disappear from all workspaces.")}
        </>
      ),
      okButtonProps: {
        danger: true,
        "data-testid":
          DATA_TEST_ID.MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton,
      },
      okText: t("Remove integration"),
      async onOk() {
        await onIntegrationDelete();
      },
    });
  }, [confirm, onIntegrationDelete, t]);

  return (
    <ContentSection title={t("Danger Zone")} danger>
      <Title>{t("Remove integration")}</Title>
      <Text>
        {t(
          "Permanently remove your Integration and all of its contents from the Re:Earth CMS. This action is not reversible – please continue with caution.",
        )}
      </Text>
      <StyledDeleteButton
        onClick={handleWorkspaceDeleteConfirmation}
        type="primary"
        danger
        data-testid={DATA_TEST_ID.MyIntegrations__Settings__DangerZone__RemoveIntegrationButton}>
        {t("Remove integration")}
      </StyledDeleteButton>
    </ContentSection>
  );
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  text-transform: capitalize;
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
  margin: 24px 0;
`;

const StyledDeleteButton = styled(Button)`
  width: fit-content;
  text-transform: capitalize;
`;
