import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import { Trans } from "react-i18next";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectVisibility } from "../Accessibility/types";

type Props = {
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  onProjectDelete: () => Promise<void>;
  onProjectVisibilityChange: (visibility: string) => Promise<void>;
  projectName: string;
  visibility?: ProjectVisibility;
};

const DangerZone: React.FC<Props> = ({
  hasDeleteRight,
  hasPublishRight,
  onProjectDelete,
  onProjectVisibilityChange,
  projectName,
  visibility,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const handleProjectDeleteConfirmation = useCallback(() => {
    confirm({
      okButtonProps: {
        danger: true,
        "data-testid": DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton,
      },
      okText: t("Delete project"),
      onOk() {
        onProjectDelete();
      },
      title: (
        <Trans
          components={{ u: <StyledProjectName /> }}
          i18nKey="Delete {{projectName}} project?"
          values={{ projectName }}
        />
      ),
    });
  }, [confirm, projectName, t, onProjectDelete]);

  const publicScopeList = useMemo(
    () => [
      { name: t("Private"), value: "PRIVATE" },
      { name: t("Public"), value: "PUBLIC" },
    ],
    [t],
  );

  const handleVisibilityChange = useCallback(
    (value: unknown) => {
      const visibility = value as string;
      const isPublic = visibility === "PUBLIC";
      const messages = {
        content1: isPublic
          ? t("All published content will be accessible to everyone.")
          : t(
              "Published content will no longer be visible, but you can access it using an API key.",
            ),
        content2: t("This action is not reversible, so please continue with caution."),
        title: isPublic
          ? t("Are you sure you want to set this project to public?")
          : t("Are you sure you want to set this project to private?"),
      };

      confirm({
        content: (
          <>
            <p>{messages.content1}</p>
            <p>{messages.content2}</p>
          </>
        ),
        async onOk() {
          await onProjectVisibilityChange?.(visibility);
        },
        title: messages.title,
      });
    },
    [onProjectVisibilityChange, t, confirm],
  );

  return (
    <ContentSection danger title={t("Danger Zone")}>
      <Title>{t("Change project visibility")}</Title>
      <StyledSelect
        disabled={!hasPublishRight}
        onChange={handleVisibilityChange}
        value={visibility}>
        {publicScopeList.map(({ name, value }) => (
          <Select.Option key={value} value={value}>
            {name}
          </Select.Option>
        ))}
      </StyledSelect>
      <Title>{t("Delete project")}</Title>
      <Text>
        {t(
          "Permanently removes your project and all of its contents from Re:Earth CMS. This action is not reversible, so please continue with caution.",
        )}
      </Text>
      <StyledButton
        danger
        data-testid={DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton}
        disabled={!hasDeleteRight}
        onClick={handleProjectDeleteConfirmation}
        type="primary">
        {t("Delete project")}
      </StyledButton>
    </ContentSection>
  );
};

export default DangerZone;

const maxWidth = "316px";

const StyledSelect = styled(Select)`
  width: ${maxWidth};
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
  text-transform: capitalize;
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
`;

const StyledButton = styled(Button)`
  width: fit-content;
  text-transform: capitalize;
`;

const StyledProjectName = styled.span`
  text-decoration: underline;
`;
