import styled from "@emotion/styled";
import MonacoEditor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { CoreVisualizer, MapRef, SketchFeature, NaiveLayerSimple, SketchType } from "@reearth/core";
import Ajv from "ajv";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Typography from "@reearth-cms/components/atoms/Typography";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import schema from "./schema";

const { Text } = Typography;

const ajv = new Ajv();
const validate = ajv.compile(schema);

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
  workspaceSettings: WorkspaceSettings;
}

const GeometryItem: React.FC<Props> = ({
  value,
  onChange,
  supportedTypes,
  isEditor,
  disabled,
  errorAdd,
  errorDelete,
  workspaceSettings,
}) => {
  console.log(workspaceSettings);
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

  const placeholderContent = useMemo(() => {
    const key = Array.isArray(supportedTypes) ? supportedTypes[0] : supportedTypes ?? "POINT";
    return JSON.stringify({ type: GEO_TYPE_MAP[key], coordinates: [] }, null, 2);
  }, [supportedTypes]);

  const [currentValue, setCurrentValue] = useState<string>();

  useEffect(() => {
    setCurrentValue(value ?? undefined);
  }, [value]);

  const [sketchType, setSketchType] = useState<SketchType>();

  const sketchButtonClick = useCallback(
    (newSketchType: SketchType) => {
      if (sketchType) {
        setSketchType(undefined);
        ref.current?.sketch?.setType(undefined);
      } else {
        setSketchType(newSketchType);
        ref.current?.sketch?.setType(newSketchType);
      }
    },
    [sketchType],
  );

  const handleZoomIn = useCallback(() => {
    ref.current?.engine.zoomIn(5);
  }, []);

  const handleZoomOut = useCallback(() => {
    ref.current?.engine.zoomOut(5);
  }, []);

  const GeoJSONConvert = useCallback(
    (value: string | SketchFeature): NaiveLayerSimple | undefined => {
      try {
        const geometry: {
          type?: unknown;
          coordinates?: unknown;
          geometries?: unknown;
        } = typeof value === "string" ? JSON.parse(value) : value?.geometry;
        const isValid = validate(geometry);
        if (!isValid) return;
        return {
          type: "simple",
          data: {
            type: "geojson",
            value: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry,
                },
              ],
            },
          },
          marker: {
            imageColor: "#000000D9",
          },
          polyline: {
            strokeColor: "#000000D9",
          },
          polygon: {
            fillColor: "#00000040",
            stroke: true,
            strokeColor: "#000000D9",
          },
        };
      } catch (_) {
        return;
      }
    },
    [],
  );

  const isInitRef = useRef(true);

  const flyTo = useCallback(
    (geometry: { coordinates?: unknown[]; geometries?: { coordinates: unknown[] }[] }) => {
      const coordinates = geometry.coordinates ?? geometry.geometries?.[0].coordinates;
      const flatCoordinates = coordinates?.flat().flat().flat();
      if (flatCoordinates) {
        ref.current?.engine.flyTo({
          lng: flatCoordinates[0] as number,
          lat: flatCoordinates[1] as number,
          height: 100000,
        });
      }
    },
    [],
  );

  const sketch = useCallback(
    (value: string | SketchFeature) => {
      const layers = ref.current?.layers.layers();
      const ids = layers?.map(layer => layer.id);
      if (ids?.length) {
        ref.current?.layers.deleteLayer(...ids);
      }
      const layer = GeoJSONConvert(value);
      if (layer) {
        ref.current?.layers.add(layer);
        if (isInitRef.current || !isEditor) {
          flyTo(layer.data?.value.features[0].geometry);
        }
      }
      setSketchType(undefined);
    },
    [GeoJSONConvert, flyTo, isEditor],
  );

  const handleSketchFeatureCreate = useCallback((feature: SketchFeature | null) => {
    if (feature) {
      editorRef.current?.setValue(JSON.stringify(feature.geometry, null, 2));
    }
  }, []);

  const ref = useRef<MapRef>(null);
  const [isReady, setIsReady] = useState(false);
  const handleMount = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      if (value !== undefined) {
        if (typeof value === "string") {
          sketch(value);
        }
        isInitRef.current = false;
      }
    }
  }, [sketch, isReady, value]);

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
        <ViewerWrapper>
          <ViewerButtons>
            {isEditor && !disabled && (
              <GeoButtons>
                {(supportedTypes === "POINT" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="mapPin" size={22} />}
                    onClick={() => {
                      sketchButtonClick("marker");
                    }}
                    selected={sketchType === "marker"}
                  />
                )}
                {(supportedTypes === "LINESTRING" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="lineString" size={26} />}
                    onClick={() => {
                      sketchButtonClick("polyline");
                    }}
                    selected={sketchType === "polyline"}
                  />
                )}
                {(supportedTypes === "POLYGON" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="polygon" size={25} />}
                    onClick={() => {
                      sketchButtonClick("polygon");
                    }}
                    selected={sketchType === "polygon"}
                  />
                )}
                {supportedTypes === "ANY" && (
                  <GeoButton
                    icon={<Icon icon="circle" size={22} />}
                    onClick={() => {
                      sketchButtonClick("circle");
                    }}
                    selected={sketchType === "circle"}
                  />
                )}
                {supportedTypes === "ANY" && (
                  <GeoButton
                    icon={<Icon icon="rectangle" size={18} />}
                    onClick={() => {
                      sketchButtonClick("rectangle");
                    }}
                    selected={sketchType === "rectangle"}
                  />
                )}
              </GeoButtons>
            )}
            <ZoomButtons>
              <Button icon={<Icon icon="plus" />} onClick={handleZoomIn} />
              <Button icon={<Icon icon="minus" />} onClick={handleZoomOut} />
            </ZoomButtons>
          </ViewerButtons>
          <CoreVisualizer
            ref={ref}
            ready={isReady}
            onMount={handleMount}
            engine={"cesium"}
            viewerProperty={{
              tiles: [
                {
                  id: "default",
                  type: "open_street_map",
                },
              ],
              indicator: {
                type: "custom",
              },
            }}
            onSketchFeatureCreate={handleSketchFeatureCreate}
          />
        </ViewerWrapper>
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
  overflow: hidden;
`;

const GeoButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
