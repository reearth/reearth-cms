import styled from "@emotion/styled";

import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { GeoUtils } from "../core/GeoUtils";
import { vertexLabel } from "../core/labels";
import { useGeoSnapshot, useGeoStore } from "../core/StoreContext";
import { EditOrigin, GeometryKind } from "../core/types";

import CoordinateInput from "./CoordinateInput";
import PanelHeader from "./PanelHeader";

type Props = {
  open: boolean;
  readOnly: boolean;
  onToggle: () => void;
};

enum Axis {
  LONGITUDE = 0,
  LATITUDE = 1,
}

/**
 * Numbers for one position: a selected Point, or the selected vertex of a line or polygon.
 * Showing one vertex rather than all of them keeps long shapes usable. Multipart shapes
 * are pointed to GeoJSON. Edits stay in the editor until Apply, like every other edit.
 */
const CoordinatesPanel: React.FC<Props> = ({ open, readOnly, onToggle }) => {
  const t = useT();

  return (
    <Panel>
      <PanelHeader title={t("Coordinates")} open={open} onToggle={onToggle} />
      {open && (
        <Body>
          <SelectedCoordinates readOnly={readOnly} />
        </Body>
      )}
    </Panel>
  );
};

const SelectedCoordinates: React.FC<{ readOnly: boolean }> = ({ readOnly }) => {
  const t = useT();
  const store = useGeoStore();
  const { collection, selectedId, selectedVertex } = useGeoSnapshot();
  const geometry = GeoUtils.findFeature(collection, selectedId)?.geometry;

  if (!selectedId || !geometry) {
    return <Hint type="secondary">{t("Select a shape to edit its coordinates.")}</Hint>;
  }

  if (!GeoUtils.isEditableKind(geometry)) {
    return (
      <Hint type="secondary">
        {readOnly
          ? t("Coordinates are shown here for points, lines and polygons only.")
          : t("This shape can't be edited here. Edit it in GeoJSON.")}
      </Hint>
    );
  }

  const isPoint = geometry.type === GeometryKind.POINT;
  const vertex = GeoUtils.listVertices(geometry)[isPoint ? 0 : (selectedVertex ?? -1)];
  if (!vertex) {
    return <Hint type="secondary">{t("Select a vertex on the map to edit its coordinates.")}</Hint>;
  }

  const setAxis = (axis: Axis, value: number) => {
    const position = [...vertex.position];
    position[axis] = value;
    store.setGeometry(
      selectedId,
      GeoUtils.setVertex(geometry, vertex.index, position),
      EditOrigin.NUMERIC,
    );
  };

  return (
    <>
      {!isPoint && <VertexName strong>{vertexLabel(vertex)}</VertexName>}
      {/* Keyed so a draft never carries over to another shape or vertex. */}
      <Row key={`${selectedId}:${vertex.index}`}>
        <CoordinateInput
          label={t("Latitude")}
          value={vertex.position[Axis.LATITUDE]}
          min={-90}
          max={90}
          disabled={readOnly}
          onCommit={value => setAxis(Axis.LATITUDE, value)}
        />
        <CoordinateInput
          label={t("Longitude")}
          value={vertex.position[Axis.LONGITUDE]}
          min={-180}
          max={180}
          disabled={readOnly}
          onCommit={value => setAxis(Axis.LONGITUDE, value)}
        />
      </Row>
      {!readOnly && (
        <Hint type="secondary">
          {isPoint
            ? t("Enter to apply · Esc to undo the change · or drag the point on the map")
            : t("Enter to apply · Esc to undo the change · or drag the vertex on the map")}
        </Hint>
      )}
    </>
  );
};

export default CoordinatesPanel;

const Panel = styled.div`
  flex-shrink: 0;
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XS}px;
  padding: 0 ${AntdToken.SPACING.SM}px ${AntdToken.SPACING.SM}px;
`;

const Row = styled.div`
  display: flex;
  gap: ${AntdToken.SPACING.XS}px;
`;

const VertexName = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

const Hint = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;
