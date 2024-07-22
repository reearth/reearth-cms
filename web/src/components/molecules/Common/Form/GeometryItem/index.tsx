import styled from "@emotion/styled";
import MonacoEditor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { CoreVisualizer, MapRef, Camera } from "@reearth/core";
import { Cartesian3, Viewer as CesiumViewer } from "cesium";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { CesiumComponentRef } from "resium";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Marker from "@reearth-cms/components/atoms/Icon/Icons/mapPinFilled.svg";
import Typography from "@reearth-cms/components/atoms/Typography";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import schema from "./schema";

const { Text } = Typography;

type GeoType = "point" | "lineString" | "polygon";
const GEO_TYPE_MAP = {
  POINT: "Point",
  MULTIPOINT: "MultiPoint",
  LINESTRING: "LineString",
  MULTILINESTRING: "MultiLineString",
  POLYGON: "Polygon",
  MULTIPOLYGON: "MultiPolygon",
  GEOMETRYCOLLECTION: "GeometryCollection",
  ANY: "Point",
} as const;

interface Props {
  value?: string | null;
  onChange?: (value: string) => void;
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  disabled?: boolean;
  errorAdd?: () => void;
  errorDelete?: () => void;
}

const GeometryItem: React.FC<Props> = ({
  value,
  onChange,
  supportedTypes,
  isEditor,
  disabled,
  errorAdd,
  errorDelete,
}) => {
  const t = useT();

  const ref = useRef<MapRef>();
  const [isMounted, setIsMounted] = useState(false);
  const handleMount = useCallback(() => {
    setIsMounted(true);
  }, []);

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

  const handleEditorWillMount: BeforeMount = useCallback(monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      schemaValidation: "error",
      schemas: [
        {
          uri: "",
          fileMatch: ["*"],
          schema,
        },
      ],
    });
  }, []);

  const handleEditorDidMount: OnMount = useCallback(editor => {
    editorRef.current = editor;
  }, []);

  const drawOnMap = useCallback(() => {
    viewer.current?.cesiumElement?.entities.removeAll();
    if (!value) return;
    try {
      const valueJson: {
        type?: unknown;
        coordinates?: unknown;
      } = JSON.parse(value);
      if (!valueJson.type || !Array.isArray(valueJson.coordinates)) return;
      const flatCoordinates = valueJson.coordinates.flat().flat().flat();
      if (flatCoordinates.length === 0) return;
      for (const coordinate of flatCoordinates) {
        if (typeof coordinate !== "number") return;
      }
      switch (valueJson.type) {
        case "Point":
          viewer.current?.cesiumElement?.entities.add({
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
          viewer.current?.cesiumElement?.entities.add({
            polyline: {
              positions: Cartesian3.fromDegreesArray(flatCoordinates),
            },
          });
          return;
        case "Polygon":
          viewer.current?.cesiumElement?.entities.add({
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

  const [hasError, setHasError] = useState(false);

  const handleErrorAdd = useCallback(() => {
    setHasError(true);
    errorAdd?.();
  }, [errorAdd]);

  const handleErrorDelete = useCallback(() => {
    setHasError(false);
    errorDelete?.();
  }, [errorDelete]);

  const handleEditorValidation = useCallback(
    (markers: editor.IMarker[]) => {
      if (markers.length > 0) {
        viewer.current?.cesiumElement?.entities.removeAll();
        handleErrorAdd();
      } else {
        handleErrorDelete();
      }
    },
    [handleErrorAdd, handleErrorDelete],
  );

  const handleEditorOnChange = useCallback(
    (value?: string) => {
      onChange?.(value ?? "");
      if (value && supportedTypes) {
        try {
          const valueJson: {
            type?: (typeof GEO_TYPE_MAP)[keyof typeof GEO_TYPE_MAP];
          } = JSON.parse(value);
          if (valueJson.type) {
            const convertedTypes = Array.isArray(supportedTypes)
              ? supportedTypes.map(type => GEO_TYPE_MAP[type])
              : supportedTypes === "ANY"
                ? [GEO_TYPE_MAP.POINT, GEO_TYPE_MAP.LINESTRING, GEO_TYPE_MAP.POLYGON]
                : [GEO_TYPE_MAP[supportedTypes]];
            if (convertedTypes.includes(valueJson.type)) {
              handleErrorDelete();
            } else {
              handleErrorAdd();
            }
          }
        } catch (_) {
          return;
        }
      } else {
        handleErrorDelete();
      }
    },
    [handleErrorAdd, handleErrorDelete, onChange, supportedTypes],
  );

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
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
    ref.current?.sketch?.setType("marker");
  }, [geoTypeSet]);

  const lineStringButtonClick = useCallback(() => {
    geoTypeSet("lineString");
    ref.current?.sketch?.setType("polyline");
  }, [geoTypeSet]);

  const polygonButtonClick = useCallback(() => {
    geoTypeSet("polygon");
    ref.current?.sketch?.setType("polygon");
  }, [geoTypeSet]);

  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>();

  const handleCameraChange = useCallback(
    (camera: Camera) => {
      setCurrentCamera(camera);
    },
    [setCurrentCamera],
  );

  const viewer = useRef<CesiumComponentRef<CesiumViewer>>();

  const handleZoom = useCallback((isZoomIn: boolean) => {
    setCurrentCamera(prev => {
      if (prev) {
        const height = isZoomIn ? prev.height / 2 : prev.height * 2;
        return { ...prev, height };
      }
    });
  }, []);

  const format = useCallback(
    (type: string, coordinates: number[] | number[][] | number[][][]) =>
      JSON.stringify({ type, coordinates }, null, 2),
    [],
  );

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
    let key: keyof typeof GEO_TYPE_MAP = "POINT";
    if (Array.isArray(supportedTypes)) {
      key = "GEOMETRYCOLLECTION";
    } else if (supportedTypes) {
      key = supportedTypes;
    }
    return format(GEO_TYPE_MAP[key], []);
  }, [format, supportedTypes]);

  const [currentValue, setCurrentValue] = useState<string>();
  useEffect(() => {
    setCurrentValue(value ?? undefined);
    drawOnMap();
  }, [drawOnMap, value]);

  const [engine, setEngine] = useState<"cesium">();

  return (
    <Container>
      <GeometryField>
        <EditorWrapper hasError={hasError}>
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
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            onChange={handleEditorOnChange}
            onValidate={handleEditorValidation}
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
            <CoreVisualizer
              ref={node => {
                if (node !== null) {
                  ref.current = node;
                  setEngine("cesium");
                }
              }}
              ready={isMounted}
              onMount={handleMount}
              engine={engine}
              sceneProperty={
                isMounted
                  ? {
                      tiles: [
                        {
                          id: "default",
                          tile_type: "open_street_map",
                        },
                      ],
                    }
                  : undefined
              }
              camera={currentCamera}
              onCameraChange={handleCameraChange}
            />
          </ViewerWrapper>
        )}
      </GeometryField>
      {hasError && <Text type="danger">{t("GeoJSON type mismatch, please check your input")}</Text>}
    </Container>
  );
};

export default GeometryItem;

const Container = styled.div`
  flex: 1;
`;

const GeometryField = styled.div`
  display: flex;
  aspect-ratio: 1.86 / 1;
  box-shadow: 0px 2px 8px 0px #00000026;
`;

const EditorWrapper = styled.div<{ hasError: boolean }>`
  width: 45%;
  position: relative;
  border: 1px solid ${({ hasError }) => (hasError ? "#ff4d4f" : "transparent")};
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
