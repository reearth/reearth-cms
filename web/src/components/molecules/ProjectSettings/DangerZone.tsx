import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import { Trans } from "react-i18next";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
      okButtonProps: {
        danger: true,
        "data-testid": DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton,
      },
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
        data-testid={DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton}
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
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  line-height: ${AntdToken.LINE_HEIGHT.LG}px;
  color: ${AntdColor.NEUTRAL.TEXT};
  text-transform: capitalize;
`;

const Text = styled.p`
  font-weight: 400;
  font-size: ${AntdToken.FONT.SIZE}px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
`;

const StyledButton = styled(Button)`
  width: fit-content;
  text-transform: capitalize;
`;

const StyledProjectName = styled.span`
  text-decoration: underline;
`;
