import styled from "@emotion/styled";
import type { Feature, Geometry } from "geojson";
import { useEffect, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Empty from "@reearth-cms/components/atoms/Empty";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { kindIcon, kindName, shapeDetail } from "../core/labels";
import { useGeoSnapshot, useGeoStore } from "../core/StoreContext";
import { FocusKind } from "../core/types";

type Props = {
  multiple: boolean;
  readOnly: boolean;
  drawHint: string;
  onDelete: (id: string) => void;
};

/**
 * Shapes in the value, in stored order. Selecting a row selects and zooms to the shape on
 * the map, and selecting on the map selects the row. Shapes the
 * map can't edit say so in the row itself, selected or not.
 */
const ShapeList: React.FC<Props> = ({ multiple, readOnly, drawHint, onDelete }) => {
  const t = useT();
  const store = useGeoStore();
  const { collection, selectedId } = useGeoSnapshot();
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (selectedId) rowRefs.current.get(selectedId)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const features = collection.features.filter((f): f is Feature<Geometry> => !!f.geometry);

  const selectRow = (id: string, geometry: Geometry) => {
    store.select(id);
    store.focus({ kind: FocusKind.GEOMETRY, geometry });
  };

  if (features.length === 0) {
    return (
      <EmptyWrapper>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <Typography.Text>{t("No geometries yet")}</Typography.Text>
              {!readOnly && <EmptyHint type="secondary">{drawHint}</EmptyHint>}
            </>
          }
        />
      </EmptyWrapper>
    );
  }

  return (
    <List role="listbox" aria-label={t("Geometries")}>
      {features.map((feature, index) => {
        const id = String(feature.id);
        const selected = id === selectedId;
        const locked = !GeoUtils.isEditableKind(feature.geometry);

        return (
          <div
            key={id}
            ref={el => void (el ? rowRefs.current.set(id, el) : rowRefs.current.delete(id))}>
            <Row
              role="option"
              aria-selected={selected}
              tabIndex={0}
              selected={selected}
              // Selecting is not a toggle: Esc or a click on empty map deselects.
              onClick={() => selectRow(id, feature.geometry)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectRow(id, feature.geometry);
                }
              }}>
              <TypeIcon selected={selected}>
                <Icon icon={kindIcon(feature.geometry.type)} size={16} />
              </TypeIcon>
              <RowText>
                <Typography.Text strong={selected}>
                  {multiple && <Index>{index + 1}</Index>}
                  {kindName(feature.geometry.type)}
                  {locked && <LockIcon icon="lock" size={12} />}
                </Typography.Text>
                <SmallText type="secondary">{shapeDetail(feature.geometry)}</SmallText>
                {locked && !readOnly && (
                  <SmallText type="secondary">
                    {t("Can't be edited on the map. Change it in GeoJSON.")}
                  </SmallText>
                )}
              </RowText>
              <Actions className="row-actions" visible={selected}>
                <Tooltip title={t("Fly to geometry")}>
                  <Button
                    size="small"
                    type="text"
                    aria-label={t("Fly to geometry")}
                    icon={<Icon icon="send" />}
                    onClick={e => {
                      e.stopPropagation();
                      store.focus({ kind: FocusKind.GEOMETRY, geometry: feature.geometry });
                    }}
                  />
                </Tooltip>
                {!readOnly && (
                  <Tooltip title={t("Delete geometry")}>
                    <Button
                      size="small"
                      type="text"
                      danger
                      aria-label={t("Delete geometry")}
                      icon={<Icon icon="delete" />}
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(id);
                      }}
                    />
                  </Tooltip>
                )}
              </Actions>
            </Row>
          </div>
        );
      })}
    </List>
  );
};

export default ShapeList;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmptyWrapper = styled.div`
  padding: ${AntdToken.SPACING.LG}px ${AntdToken.SPACING.BASE}px;
  text-align: center;
`;

const Row = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  cursor: pointer;
  background: ${({ selected }) => (selected ? AntdColor.BLUE.BLUE_0 : "transparent")};
  box-shadow: ${({ selected }) => (selected ? `inset 3px 0 0 ${AntdColor.BLUE.BLUE_5}` : "none")};
  &:hover {
    background: ${({ selected }) => (selected ? AntdColor.BLUE.BLUE_0 : AntdColor.NEUTRAL.BG_ELEVATED)};
  }
  &:hover .row-actions {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${AntdColor.BLUE.BLUE_5};
    outline-offset: -2px;
  }
`;

const TypeIcon = styled.span<{ selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: ${AntdToken.RADIUS.SM}px;
  color: ${({ selected }) => (selected ? AntdColor.BLUE.BLUE_6 : AntdColor.NEUTRAL.TEXT_TERTIARY)};
  background: ${({ selected }) => (selected ? AntdColor.NEUTRAL.BG_WHITE : AntdColor.NEUTRAL.FILL_TERTIARY)};
`;

const RowText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.3;
`;

const Index = styled.span`
  display: inline-block;
  min-width: 18px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  font-variant-numeric: tabular-nums;
`;

const EmptyHint = styled(Typography.Paragraph)`
  &.ant-typography {
    margin-top: ${AntdToken.SPACING.XXS}px;
  }
`;

const SmallText = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

const LockIcon = styled(Icon)`
  margin-left: ${AntdToken.SPACING.XXS}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const Actions = styled.div<{ visible: boolean }>`
  display: flex;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.15s;
  &:focus-within {
    opacity: 1;
  }
`;
