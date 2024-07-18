import styled from "@emotion/styled";
import MonacoEditor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { Ion, Cartesian3, Viewer as CesiumViewer, Cartographic, Math, SceneMode } from "cesium";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  CesiumComponentRef,
  CesiumMovementEvent,
  Viewer,
  ScreenSpaceCameraController,
  RootEventTarget,
} from "resium";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Marker from "@reearth-cms/components/atoms/Icon/Icons/mapPinFilled.svg";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { config } from "@reearth-cms/config";
import { useT } from "@reearth-cms/i18n";

type GeoType = "point" | "lineString" | "polygon";
const geoTypeMap = {
  POINT: "Point",
  MULTIPOINT: "MultiPoint",
  LINESTRING: "LineString",
  MULTILINESTRING: "MultiLineString",
  POLYGON: "Polygon",
  MULTIPOLYGON: "MultiPolygon",
  GEOMETRYCOLLECTION: "GeometryCollection",
  ANY: "Point",
};

interface Props {
  value?: string | null;
  onChange?: (value: string) => void;
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  disabled?: boolean;
}

const GeometryItem: React.FC<Props> = ({ value, onChange, supportedTypes, isEditor, disabled }) => {
  const t = useT();

  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const copyButtonClick = useCallback(() => {
    const value = editorRef.current?.getValue();
    if (value) navigator.clipboard.writeText(value);
  }, []);
  const editorDeleteButtonClick = useCallback(() => {
    editorRef.current?.setValue("");
  }, []);

  const options = useMemo(
    () => ({
      bracketPairColorization: {
        enabled: true,
      },
      minimap: {
        enabled: false,
      },
      readOnly: disabled || isEditor,
      readOnlyMessage: { value: t("Cannot edit in read-only editor") },
      wordWrap: "on" as const,
      scrollBeyondLastLine: false,
    }),
    [disabled, isEditor, t],
  );

  const handleEditorOnChange = useCallback(
    (value?: string) => {
      onChange?.(value ?? "");
    },
    [onChange],
  );

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
  }, []);

  const handleEditorWillMount: BeforeMount = useCallback(monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      schemaValidation: "error",
      schemas: [
        {
          uri: "",
          fileMatch: ["*"],
          schema: {
            type: "object",
            properties: {
              type: {
                enum: [
                  "Point",
                  "LineString",
                  "Polygon",
                  "MultiPoint",
                  "MultiLineString",
                  "MultiPolygon",
                  "GeometryCollection",
                ],
              },
              coordinates: {},
            },
          },
        },
      ],
    });
  }, []);

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    Ion.defaultAccessToken = config()?.cesiumIonAccessToken ?? Ion.defaultAccessToken;
    setIsReady(true);
  }, []);

  const [geoType, setGeoType] = useState<GeoType>();
  const [isDrawing, setIsDrawing] = useState(false);

  const geoTypeSet = useCallback((type: GeoType) => {
    setGeoType(type);
    setIsDrawing(prev => !prev);
  }, []);

  const pinButtonClick = useCallback(() => {
    geoTypeSet("point");
  }, [geoTypeSet]);

  const lineStringButtonClick = useCallback(() => {
    geoTypeSet("lineString");
  }, [geoTypeSet]);

  const polygonButtonClick = useCallback(() => {
    geoTypeSet("polygon");
  }, [geoTypeSet]);

  const [geoValues, setGeoValues] = useState<Map<string, number[]>>(new Map());
  const [enableTranslate, setEnableTranslate] = useState(true);

  const viewer = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const handleZoom = useCallback((isZoomIn: boolean) => {
    if (viewer.current?.cesiumElement) {
      const ellipsoid = viewer.current.cesiumElement.scene.globe.ellipsoid;
      const camera = viewer.current.cesiumElement.camera;
      const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
      const moveRate = cameraHeight / 10;
      if (isZoomIn) {
        camera.moveForward(moveRate);
      } else {
        camera.moveBackward(moveRate);
      }
    }
  }, []);

  const format = useCallback(
    (type: string, coordinates: number[] | number[][] | number[][][]) =>
      JSON.stringify({ type, coordinates }, null, 2),
    [],
  );

  const positionsRef = useRef<number[][]>([]);

  const handleClick = useCallback(
    (_movement: CesiumMovementEvent) => {
      if (!isDrawing || !_movement.position || !viewer.current?.cesiumElement) return;
      const ellipsoid = viewer.current.cesiumElement.scene.globe.ellipsoid;
      const cartesian = viewer.current.cesiumElement.camera.pickEllipsoid(
        _movement.position,
        ellipsoid,
      );
      if (!cartesian) return;
      const cartographic = Cartographic.fromCartesian(cartesian);
      const lon = Math.toDegrees(cartographic.longitude);
      const lat = Math.toDegrees(cartographic.latitude);
      if (geoType === "point") {
        setIsDrawing(false);
        editorRef.current?.setValue(format("Point", [lon, lat]));
      } else {
        positionsRef.current?.push([lon, lat]);
        if (geoType === "lineString") {
          editorRef.current?.setValue(format("LineString", positionsRef.current));
        } else {
          editorRef.current?.setValue(
            format("Polygon", [[...positionsRef.current, positionsRef.current[0]]]),
          );
        }
      }
    },
    [format, geoType, isDrawing],
  );

  const timeout = useRef<NodeJS.Timeout>();
  const singleClick = useCallback(
    (movement: CesiumMovementEvent) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = undefined;
      } else {
        timeout.current = setTimeout(() => {
          handleClick(movement);
          timeout.current = undefined;
        }, 250);
      }
    },
    [handleClick],
  );

  const doubleClick = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const [isGrabbing, setIsGrabbing] = useState(false);
  const [entityId, setEntityId] = useState("");

  const onMouseDown = useCallback(() => {
    setIsGrabbing(true);
  }, []);

  const onMouseMove = useCallback(
    (movement: CesiumMovementEvent, _: RootEventTarget) => {
      if (entityId && viewer.current?.cesiumElement && movement.endPosition) {
        const cartesian = viewer.current.cesiumElement.camera.pickEllipsoid(
          movement.endPosition,
          viewer.current.cesiumElement.scene.globe.ellipsoid,
        );
        const point = viewer.current.cesiumElement.entities.getById(entityId);
        if (point && cartesian) {
          point.position = cartesian as any;
          const cartographic = Cartographic.fromCartesian(cartesian);
          const lon = Math.toDegrees(cartographic.longitude);
          const lat = Math.toDegrees(cartographic.latitude);
          setGeoValues(prev => {
            prev.set(entityId, [lon, lat]);
            return new Map(prev);
          });
        }
      }
    },
    [entityId],
  );

  const onMouseUp = useCallback(() => {
    setEntityId("");
    setIsGrabbing(false);
  }, []);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setIsDrawing(false);
      }
    };
    document.addEventListener("keydown", handleEnter);
    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  const placeholderContent = useMemo(() => {
    let key: keyof typeof geoTypeMap = "POINT";
    if (Array.isArray(supportedTypes)) {
      key = "GEOMETRYCOLLECTION";
    } else if (supportedTypes) {
      key = supportedTypes;
    }
    return format(geoTypeMap[key], []);
  }, [format, supportedTypes]);

  const [currentValue, setCurrentValue] = useState<string>();
  useEffect(() => {
    setCurrentValue(value ?? undefined);
    if (!viewer.current?.cesiumElement) return;
    viewer.current.cesiumElement.entities.removeAll();
    try {
      const valueJson: {
        type?: string;
        coordinates?: number[] | number[][] | number[][][] | number[][][][];
      } = JSON.parse(JSON.parse(JSON.stringify(value ?? "")));
      if (!valueJson.type || !valueJson.coordinates) return;
      const flatCoordinates = valueJson.coordinates.flat().flat().flat();
      if (flatCoordinates.length === 0) return;
      for (const coordinate of flatCoordinates) {
        if (typeof coordinate !== "number") return;
      }
      switch (valueJson.type) {
        case "Point":
          viewer.current.cesiumElement.entities.add({
            position: Cartesian3.fromDegreesArray(flatCoordinates)[0],
            billboard: {
              image: Marker,
              width: 28,
              height: 28,
            },
          });
          return;
        case "MultiPoint":
          return;
        case "LineString":
          viewer.current.cesiumElement.entities.add({
            polyline: {
              positions: Cartesian3.fromDegreesArray(flatCoordinates),
            },
          });
          return;
        case "Polygon":
          viewer.current.cesiumElement.entities.add({
            polygon: {
              hierarchy: Cartesian3.fromDegreesArray(flatCoordinates),
              extrudedHeight: 50000,
            },
          });
          return;
        case "MultiLineString":
        case "MultiPolygon":
        default:
          return;
      }
    } catch (_) {
      return;
    }
  }, [value]);

  return (
    <GeometryField>
      <EditorWrapper>
        <EditorButtons>
          <EditorButton
            icon={<Icon icon="editorCopy" size={12} />}
            size="small"
            onClick={copyButtonClick}
          />
          {!disabled && !isEditor && (
            <EditorButton
              icon={<Icon icon="trash" size={12} />}
              size="small"
              onClick={editorDeleteButtonClick}
            />
          )}
        </EditorButtons>
        <MonacoEditor
          height="100%"
          language={"json"}
          options={options}
          value={currentValue}
          onChange={handleEditorOnChange}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
        />
        <Placeholder isEmpty={!value}>{placeholderContent}</Placeholder>
      </EditorWrapper>
      {isReady && (
        <ViewerWrapper>
          <ViewerButtons>
            {isEditor && (
              <GeoButtons>
                {(supportedTypes === "POINT" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="mapPin" size={22} />}
                    onClick={pinButtonClick}
                    selected={isDrawing && geoType === "point"}
                  />
                )}
                {(supportedTypes === "LINESTRING" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="lineString" size={22} />}
                    onClick={lineStringButtonClick}
                    selected={isDrawing && geoType === "lineString"}
                  />
                )}
                {(supportedTypes === "POLYGON" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="polygon" size={22} />}
                    onClick={polygonButtonClick}
                    selected={isDrawing && geoType === "polygon"}
                  />
                )}
              </GeoButtons>
            )}
            <ZoomButtons>
              <Button
                icon={<Icon icon="plus" />}
                onClick={() => {
                  handleZoom(true);
                }}
              />
              <Button
                icon={<Icon icon="minus" />}
                onClick={() => {
                  handleZoom(false);
                }}
              />
            </ZoomButtons>
          </ViewerButtons>
          <StyledViewer
            infoBox={false}
            navigationHelpButton={false}
            homeButton={false}
            projectionPicker={false}
            sceneModePicker={false}
            sceneMode={SceneMode.SCENE2D}
            baseLayerPicker={false}
            fullscreenButton={false}
            vrButton={false}
            selectionIndicator={false}
            timeline={false}
            animation={false}
            geocoder={false}
            onClick={singleClick}
            onDoubleClick={doubleClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            ref={viewer}
            isGrabbing={isGrabbing}
            isDrawing={isDrawing}>
            <ScreenSpaceCameraController enableTranslate={enableTranslate} />
          </StyledViewer>
        </ViewerWrapper>
      )}
    </GeometryField>
  );
};

export default GeometryItem;

const GeometryField = styled.div`
  display: flex;
  width: 100%;
  aspect-ratio: 1.86 / 1;
  box-shadow: 0px 2px 8px 0px #00000026;
`;

const EditorWrapper = styled.div`
  width: 45%;
  position: relative;
`;

const EditorButtons = styled.div`
  position: absolute;
  right: 8px;
  color: #8c8c8c;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
`;

const EditorButton = styled(Button)`
  color: #8c8c8c;
`;

const Placeholder = styled.div<{ isEmpty: boolean }>`
  display: ${({ isEmpty }) => (isEmpty ? "block" : "none")};
  position: absolute;
  white-space: pre-wrap;
  top: 0px;
  left: 65px;
  font-size: 14px;
  color: #bfbfbf;
  font-family: Consolas, "Courier New", monospace;
  pointer-events: none;
  user-select: none;
  line-height: 1.4;
`;

const ViewerWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const StyledViewer = styled(Viewer)<{ isDrawing: boolean; isGrabbing: boolean }>`
  height: 100%;
  cursor: ${({ isDrawing, isGrabbing }) =>
    isDrawing ? "crosshair" : isGrabbing ? "grabbing" : "grab"};
`;

const ViewerButtons = styled.div`
  z-index: 1;
  position: absolute;
  right: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const GeoButtons = styled.div`
  padding: 15px 0;
`;

const GeoButton = styled(Button)<{ selected: boolean }>`
  color: ${({ selected }) => (selected ? "#1677ff" : "#434343")};
`;

const ZoomButtons = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  button:first-child {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  button:last-child {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
`;
