import styled from "@emotion/styled";
import type { ReactNode } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Typography from "@reearth-cms/components/atoms/Typography";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  open: boolean;
  /** Shown next to the title, e.g. a status tag. */
  status?: ReactNode;
  /** Buttons at the right end, outside the toggle. */
  actions?: ReactNode;
  onToggle: () => void;
};

/** Header of a collapsible side panel: the whole title area toggles it. */
const PanelHeader: React.FC<Props> = ({ title, open, status, actions, onToggle }) => (
  <Header>
    <Toggle type="button" onClick={onToggle} aria-expanded={open}>
      <Icon icon={open ? "caretDown" : "caretRight"} size={12} />
      <Typography.Text strong>{title}</Typography.Text>
      {status}
    </Toggle>
    {actions}
  </Header>
);

export default PanelHeader;

/** Height of a collapsed panel: just its header. */
export const PANEL_HEADER_HEIGHT = 40;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${AntdToken.SPACING.XS}px 0 0;
  height: ${PANEL_HEADER_HEIGHT}px;
  flex-shrink: 0;
`;

const Toggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  height: 100%;
  flex: 1;
  padding: 0 ${AntdToken.SPACING.SM}px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  &:focus-visible {
    outline: 2px solid ${AntdColor.BLUE.BLUE_5};
    outline-offset: -2px;
  }
`;
