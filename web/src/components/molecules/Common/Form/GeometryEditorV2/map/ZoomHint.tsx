import styled from "@emotion/styled";

import { useT } from "@reearth-cms/i18n";
import { BrowserUtils } from "@reearth-cms/utils/browserUtils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { alpha } from "./mapStyle";

/** Hidden until the map is hovered; the parent shows it with `&:hover .zoom-hint`. */
const ZoomHint: React.FC = () => {
  const t = useT();
  return (
    <Hint className="zoom-hint">
      {BrowserUtils.IS_MAC ? t("⌘ + scroll to zoom") : t("Ctrl + scroll to zoom")}
    </Hint>
  );
};

export default ZoomHint;

const Hint = styled.div`
  position: absolute;
  left: ${AntdToken.SPACING.XS}px;
  bottom: ${AntdToken.SPACING.XS}px;
  padding: 2px ${AntdToken.SPACING.XS}px;
  border-radius: ${AntdToken.RADIUS.SM}px;
  background: ${alpha(AntdColor.NEUTRAL.BG_WHITE, 0.85)};
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  font-size: 11px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
`;
