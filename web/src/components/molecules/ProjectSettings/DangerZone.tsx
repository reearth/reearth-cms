import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import { Trans } from "react-i18next";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { ProjectVisibility } from "../Accessibility/types";

type Props = {
  projectName: string;
  visibility?: ProjectVisibility;
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  onProjectDelete: () => Promise<void>;
  onProjectVisibilityChange: (visibility: string) => Promise<void>;
};

const DangerZone: React.FC<Props> = ({
  projectName,
  visibility,
  hasDeleteRight,
  hasPublishRight,
  onProjectDelete,
  onProjectVisibilityChange,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const handleProjectDeleteConfirmation = useCallback(() => {
    confirm({
      title: (
        <Trans
          i18nKey="Delete {{projectName}} project?"
          values={{ projectName }}
          components={{ u: <StyledProjectName /> }}
        />
      ),
      okText: t("Delete project"),
      okButtonProps: { danger: true },
      onOk() {
        onProjectDelete();
      },
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
        title: isPublic
          ? t("Are you sure you want to set this project to public?")
          : t("Are you sure you want to set this project to private?"),
        content1: isPublic
          ? t("All published content will be accessible to everyone.")
          : t(
              "Published content will no longer be visible, but you can access it using an API key.",
            ),
        content2: t("This action is not reversible, so please continue with caution."),
      };

      confirm({
        title: messages.title,
        content: (
          <>
            <p>{messages.content1}</p>
            <p>{messages.content2}</p>
          </>
        ),
        async onOk() {
          await onProjectVisibilityChange?.(visibility);
        },
      });
    },
    [onProjectVisibilityChange, t, confirm],
  );

  return (
    <ContentSection title={t("Danger Zone")} danger>
      <Title>{t("Change project visibility")}</Title>
      <StyledSelect
        disabled={!hasPublishRight}
        value={visibility}
        onChange={handleVisibilityChange}>
        {publicScopeList.map(({ value, name }) => (
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
        onClick={handleProjectDeleteConfirmation}
        type="primary"
        danger
        disabled={!hasDeleteRight}>
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
