import styled from "@emotion/styled";
import type { Feature, Geometry } from "geojson";
import { useState } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { GeoUtils } from "../core/GeoUtils";
import { vertexLabel } from "../core/labels";
import { useGeoStore } from "../core/StoreContext";
import { EditOrigin, GeometryKind } from "../core/types";

import CoordinateInput from "./CoordinateInput";

type Props = {
  feature: Feature;
  readOnly: boolean;
  onShowJson: () => void;
};

/**
 * The one place coordinates are edited. It replaces both the PoC's Form card and its
 * Inspector, which showed the same numbers twice in opposite orders.
 */
const ShapeDetails: React.FC<Props> = ({ feature, readOnly, onShowJson }) => {
  const t = useT();
  const store = useGeoStore();
  const [showVertices, setShowVertices] = useState(false);
  const geometry = feature.geometry as Geometry;
  const id = String(feature.id);

  const setVertex = (index: number, axis: 0 | 1, value: number) => {
    const vertex = GeoUtils.listVertices(geometry)[index];
    if (!vertex) return;
    const position = [...vertex.position];
    position[axis] = value;
    store.setGeometry(id, GeoUtils.setVertex(geometry, index, position), EditOrigin.NUMERIC);
  };

  if (!GeoUtils.isEditableKind(geometry)) {
    return (
      <Details>
        <Alert
          type="info"
          showIcon
          icon={<Icon icon="lock" />}
          message={t("{{type}} can't be edited on the map", { type: geometry.type })}
          description={
            <>
              <div>{t("You can delete it, or change it in the GeoJSON panel.")}</div>
              <Button size="small" onClick={onShowJson} style={{ marginTop: AntdToken.SPACING.XS }}>
                {t("Open GeoJSON")}
              </Button>
            </>
          }
        />
      </Details>
    );
  }

  if (geometry.type === GeometryKind.POINT) {
    const [lng, lat] = geometry.coordinates;
    return (
      <Details>
        <Row>
          <CoordinateInput
            label={t("Latitude")}
            value={lat}
            min={-90}
            max={90}
            disabled={readOnly}
            onCommit={v => setVertex(0, 1, v)}
          />
          <CoordinateInput
            label={t("Longitude")}
            value={lng}
            min={-180}
            max={180}
            disabled={readOnly}
            onCommit={v => setVertex(0, 0, v)}
          />
        </Row>
        {!readOnly && (
          <Hint type="secondary">
            {t("Enter to apply · Esc to undo the change · or drag the point on the map")}
          </Hint>
        )}
      </Details>
    );
  }

  const vertices = GeoUtils.listVertices(geometry);
  return (
    <Details>
      {!readOnly && (
        <Hint type="secondary">
          {t(
            "Drag a vertex to move it. Drag the middle of an edge to add one. Alt-click a vertex to remove it.",
          )}
        </Hint>
      )}
      <Button
        size="small"
        type="link"
        style={{ padding: 0, alignSelf: "flex-start" }}
        onClick={() => setShowVertices(v => !v)}
        aria-expanded={showVertices}>
        {showVertices
          ? t("Hide coordinates")
          : t("Edit {{count}} vertices as numbers", { count: vertices.length })}
      </Button>
      {showVertices && (
        <VertexTable role="table" aria-label={t("Vertices")}>
          <VertexHead role="row">
            <span role="columnheader">#</span>
            <span role="columnheader">{t("Latitude")}</span>
            <span role="columnheader">{t("Longitude")}</span>
            <span />
          </VertexHead>
          {vertices.map(vertex => (
            <VertexRow role="row" key={vertex.index}>
              <Typography.Text type="secondary" style={{ fontSize: AntdToken.FONT.SIZE_SM }}>
                {vertexLabel(vertex)}
              </Typography.Text>
              <CoordinateInput
                hideLabel
                label={`${t("Latitude")} ${vertexLabel(vertex)}`}
                value={vertex.position[1]}
                min={-90}
                max={90}
                disabled={readOnly}
                onCommit={v => setVertex(vertex.index, 1, v)}
              />
              <CoordinateInput
                hideLabel
                label={`${t("Longitude")} ${vertexLabel(vertex)}`}
                value={vertex.position[0]}
                min={-180}
                max={180}
                disabled={readOnly}
                onCommit={v => setVertex(vertex.index, 0, v)}
              />
              {!readOnly && (
                <Tooltip title={t("Remove vertex")}>
                  <Button
                    size="small"
                    type="text"
                    aria-label={t("Remove vertex")}
                    disabled={!GeoUtils.canRemoveVertex(geometry, vertex.index)}
                    icon={<Icon icon="minus" />}
                    onClick={() =>
                      store.setGeometry(
                        id,
                        GeoUtils.removeVertex(geometry, vertex.index),
                        EditOrigin.LIST,
                      )
                    }
                  />
                </Tooltip>
              )}
            </VertexRow>
          ))}
        </VertexTable>
      )}
    </Details>
  );
};

export default ShapeDetails;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XS}px;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px ${AntdToken.SPACING.SM}px 40px;
`;

const Row = styled.div`
  display: flex;
  gap: ${AntdToken.SPACING.XS}px;
`;

const Hint = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

const VertexTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XXS}px;
  max-height: 240px;
  overflow-y: auto;
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding-top: ${AntdToken.SPACING.XXS}px;
`;

const grid = `
  display: grid;
  grid-template-columns: 56px 1fr 1fr 24px;
  gap: ${AntdToken.SPACING.XXS}px;
  align-items: center;
`;

const VertexHead = styled.div`
  ${grid}
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const VertexRow = styled.div`
  ${grid}
`;
