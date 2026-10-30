import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { BrowserUtils } from "@reearth-cms/utils/browserUtils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  multiple: boolean;
  readOnly: boolean;
  sideOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** Apply is blocked while the GeoJSON text has problems. */
  applyBlocked: boolean;
  onToggleSide: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCancel: () => void;
  onApply: () => void;
  onClose: () => void;
};

const EditorHeader: React.FC<Props> = ({
  title,
  multiple,
  readOnly,
  sideOpen,
  canUndo,
  canRedo,
  applyBlocked,
  onToggleSide,
  onUndo,
  onRedo,
  onCancel,
  onApply,
  onClose,
}) => {
  const t = useT();

  return (
    <Header>
      <Title>
        <Tooltip title={sideOpen ? t("Hide panel") : t("Show panel")}>
          <Button
            type="text"
            aria-label={sideOpen ? t("Hide panel") : t("Show panel")}
            aria-expanded={sideOpen}
            icon={<Icon icon={sideOpen ? "panelToggleLeft" : "panelToggleRight"} />}
            onClick={onToggleSide}
          />
        </Tooltip>
        <TitleText level={5}>{title}</TitleText>
        <Tooltip
          title={
            multiple
              ? t(
                  "This field holds several shapes. Each new drawing or search result is added as another shape.",
                )
              : t(
                  "This field holds one shape. Drawing a shape or adding a search result replaces the current one.",
                )
          }>
          <ModeTag bordered={false}>{multiple ? t("Multiple shapes") : t("Single shape")}</ModeTag>
        </Tooltip>
        {readOnly && <Tag color="default">{t("Read only")}</Tag>}
      </Title>
      <HeaderActions>
        {!readOnly && (
          <>
            <Tooltip title={`${t("Undo")} (${BrowserUtils.MOD_KEY}+Z)`}>
              <Button
                type="text"
                aria-label={t("Undo")}
                icon={<Icon icon="undo" />}
                disabled={!canUndo}
                onClick={onUndo}
              />
            </Tooltip>
            <Tooltip title={`${t("Redo")} (${BrowserUtils.MOD_KEY}+Shift+Z)`}>
              <Button
                type="text"
                aria-label={t("Redo")}
                icon={<Icon icon="redo" />}
                disabled={!canRedo}
                onClick={onRedo}
              />
            </Tooltip>
            <Divider />
            <Button onClick={onCancel}>{t("Cancel")}</Button>
            <Tooltip title={applyBlocked ? t("Fix the GeoJSON problems first") : undefined}>
              <Button type="primary" disabled={applyBlocked} onClick={onApply}>
                {t("Apply")}
              </Button>
            </Tooltip>
          </>
        )}
        {readOnly && <Button onClick={onClose}>{t("Close")}</Button>}
      </HeaderActions>
    </Header>
  );
};

export default EditorHeader;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${AntdToken.SPACING.BASE}px;
  height: 56px;
  flex-shrink: 0;
  padding: 0 ${AntdToken.SPACING.BASE}px 0 ${AntdToken.SPACING.SM}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  min-width: 0;
`;

const TitleText = styled(Typography.Title)`
  &.ant-typography {
    margin: 0;
  }
`;

const ModeTag = styled(Tag)`
  cursor: help;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
`;

const Divider = styled.span`
  width: 1px;
  height: 20px;
  margin: 0 ${AntdToken.SPACING.XXS}px;
  background: ${AntdColor.NEUTRAL.BORDER};
`;
