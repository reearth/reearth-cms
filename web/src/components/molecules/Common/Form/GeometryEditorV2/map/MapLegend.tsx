import styled from "@emotion/styled";

import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { ShapeStyle } from "./mapStyle";

const MapLegend: React.FC = () => {
  const t = useT();

  return (
    <Legend aria-label={t("Map legend")}>
      <Row>
        <Swatch colour={ShapeStyle.EDITABLE} dashed={false} />
        {t("Editable on the map")}
      </Row>
      <Row>
        <Swatch colour={ShapeStyle.READ_ONLY} dashed />
        {t("Read-only on the map, edit in GeoJSON")}
      </Row>
    </Legend>
  );
};

export default MapLegend;

const Legend = styled.div`
  position: absolute;
  left: ${AntdToken.SPACING.SM}px;
  bottom: ${AntdToken.SPACING.SM}px;
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XXS}px;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  border-radius: ${AntdToken.RADIUS.SM}px;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  box-shadow: 0 1px 4px ${AntdColor.NEUTRAL.TEXT_QUATERNARY};
  color: ${AntdColor.NEUTRAL.TEXT};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  pointer-events: none;
  z-index: 1;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
`;

const Swatch = styled.span<{ colour: string; dashed: boolean }>`
  width: 24px;
  border-top: 2px ${({ dashed }) => (dashed ? "dashed" : "solid")} ${({ colour }) => colour};
`;
