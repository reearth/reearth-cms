import styled from "@emotion/styled";
import MonacoEditor, { OnMount, BeforeMount } from "@monaco-editor/react";
import {
  CoreVisualizer,
  MapRef,
  SketchFeature,
  NaiveLayerSimple,
  SketchType,
  ViewerProperty,
} from "@reearth/core";
import Ajv from "ajv";
import axios from "axios";
import { editor, Range } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Typography from "@reearth-cms/components/atoms/Typography";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { config } from "@reearth-cms/config";
import { useT } from "@reearth-cms/i18n";

import schema from "./schema";

const { Text } = Typography;

const ajv = new Ajv();
const validate = ajv.compile(schema);

const LOCALSTORAGE_KEY = "disableGeometryWarning";

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

const TILE_TYPE_MAP = {
  DEFAULT: "default",
  LABELLED: "default_label",
  ROAD_MAP: "default_road",
  OPEN_STREET_MAP: "open_street_map",
  ESRI_TOPOGRAPHY: "esri_world_topo",
  EARTH_AT_NIGHT: "black_marble",
  JAPAN_GSI_STANDARD_MAP: "japan_gsi_standard",
  URL: "url",
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
  const t = useT();

  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const copyButtonClick = useCallback(() => {
    const value = editorRef.current?.getValue();
    if (value) navigator.clipboard.writeText(value);
  }, []);

  const deleteButtonClick = useCallback(() => {
    editorRef.current?.setValue("");
  }, []);

  const options = useMemo(
    () =>
      ({
        bracketPairColorization: {
          enabled: true,
        },
        minimap: {
          enabled: false,
        },
        readOnly: disabled || isEditor,
        readOnlyMessage: { value: t("Cannot edit in read-only editor") },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        glyphMargin: true,
        lineNumbersMinChars: 3,
        folding: false,
        tabSize: 2,
      }) as const,
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

  const allErrorRemove = useCallback(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    const decorations = model?.getAllMarginDecorations();
    if (decorations) {
      editorRef.current.removeDecorations(decorations.map(decoration => decoration.id));
    }
  }, []);

  const errorShow = useCallback((startLine: number, endLine: number) => {
    if (!editorRef.current) return;
    editorRef.current.createDecorationsCollection([
      {
        range: new Range(startLine, 1, endLine, 1),
        options: {
          glyphMarginClassName: "glyphMargin",
        },
      },
    ]);
  }, []);

  const handleEditorValidation = useCallback(
    (markers: editor.IMarker[]) => {
      allErrorRemove();
      if (markers.length > 0) {
        markers.forEach(marker => errorShow(marker.startLineNumber, marker.endLineNumber));
        handleErrorAdd();
      } else {
        handleErrorDelete();
      }
    },
    [allErrorRemove, errorShow, handleErrorAdd, handleErrorDelete],
  );

  const typeCheck = useCallback(
    (isTypeChange: boolean) => {
      if (value && supportedTypes) {
        try {
          const valueJson: {
            type?: (typeof GEO_TYPE_MAP)[keyof typeof GEO_TYPE_MAP];
          } = JSON.parse(value);
          const isValid = validate(valueJson);
          if (isValid && valueJson.type) {
            const convertedTypes = Array.isArray(supportedTypes)
              ? supportedTypes.map(type => GEO_TYPE_MAP[type])
              : supportedTypes === "ANY"
                ? [GEO_TYPE_MAP.POINT, GEO_TYPE_MAP.LINESTRING, GEO_TYPE_MAP.POLYGON]
                : [GEO_TYPE_MAP[supportedTypes]];
            if (convertedTypes.includes(valueJson.type)) {
              isTypeChange ? setHasError(false) : handleErrorDelete();
            } else {
              isTypeChange ? setHasError(true) : handleErrorAdd();
            }
          }
        } catch (_) {
          return;
        }
      } else {
        isTypeChange ? setHasError(false) : handleErrorDelete();
      }
    },
    [handleErrorAdd, handleErrorDelete, supportedTypes, value],
  );

  const handleEditorOnChange = useCallback(
    (value?: string) => {
      onChange?.(value ?? "");
      typeCheck(false);
    },
    [onChange, typeCheck],
  );

  const [currentValue, setCurrentValue] = useState<string | undefined>();
  useEffect(() => {
    setCurrentValue(value ?? undefined);
  }, [value]);

  useEffect(() => {
    if (value === currentValue) {
      typeCheck(true);
    }
  }, [currentValue, typeCheck, value]);

  const placeholderContent = useMemo(() => {
    const key = Array.isArray(supportedTypes) ? supportedTypes[0] : supportedTypes ?? "POINT";
    const obj: {
      type: string;
      coordinates?: unknown;
      geometries?: unknown;
    } = { type: GEO_TYPE_MAP[key] };
    if (key === "GEOMETRYCOLLECTION") {
      obj.geometries = [
        {
          type: "Point",
          coordinates: [],
        },
      ];
    } else {
      obj.coordinates = [];
    }
    return JSON.stringify(obj, null, 2);
  }, [supportedTypes]);

  const mapRef = useRef<MapRef>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q) return;
    setIsSearching(true);
    try {
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { format: "json", q },
      });
      if (data.length) {
        mapRef.current?.engine.flyTo({
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const viewerProperty: ViewerProperty = useMemo(
    () => ({
      tiles: [
        {
          id: "default",
          type: TILE_TYPE_MAP[workspaceSettings.tiles?.resources[0]?.type ?? "DEFAULT"],
          url: workspaceSettings.tiles?.resources[0]?.props.url,
        },
      ],
      terrain: { enabled: workspaceSettings.terrains?.enabled },
      indicator: {
        type: "custom",
      },
    }),
    [workspaceSettings.terrains?.enabled, workspaceSettings.tiles?.resources],
  );

  const [sketchType, setSketchType] = useState<SketchType>();

  const setType = useCallback((newSketchType?: SketchType) => {
    setSketchType(newSketchType);
    mapRef.current?.sketch?.setType(newSketchType);
  }, []);

  const confirm = useCallback(
    (newSketchType: SketchType) => {
      Modal.confirm({
        title: t("You are entering a new value"),
        icon: <Icon icon="exclamationCircle" />,
        content: (
          <div>
            <p>
              {t("This action will replace the previously entered value. Do you want to continue?")}
            </p>
            <Checkbox
              onChange={e => {
                if (e.target.checked) {
                  localStorage.setItem(LOCALSTORAGE_KEY, "true");
                } else {
                  localStorage.removeItem(LOCALSTORAGE_KEY);
                }
              }}>
              {t("Do not show this again")}
            </Checkbox>
          </div>
        ),
        okText: t("Continue"),
        cancelText: t("Cancel"),
        onOk() {
          setType(newSketchType);
        },
      });
    },
    [setType, t],
  );

  const sketchButtonClick = useCallback(
    (newSketchType: SketchType) => {
      if (sketchType) {
        setType();
      } else if (value && !localStorage.getItem(LOCALSTORAGE_KEY)) {
        confirm(newSketchType);
      } else {
        setType(newSketchType);
      }
    },
    [confirm, setType, sketchType, value],
  );

  const handleZoomIn = useCallback(() => {
    mapRef.current?.engine.zoomIn(5);
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.engine.zoomOut(5);
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
              type: "Feature",
              geometry,
            },
          },
          marker: {},
          polyline: {},
          polygon: {},
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
      let coordinates = geometry.coordinates ?? geometry.geometries?.[0].coordinates;
      if (coordinates) {
        while (Array.isArray(coordinates[0])) {
          coordinates = coordinates.flat();
        }
        mapRef.current?.engine.flyTo({
          lng: coordinates[0] as number,
          lat: coordinates[1] as number,
          height: 100000,
        });
      }
    },
    [],
  );

  const sketch = useCallback(
    (value: string | SketchFeature) => {
      const layers = mapRef.current?.layers.layers();
      const ids = layers?.map(layer => layer.id);
      if (ids?.length) {
        mapRef.current?.layers.deleteLayer(...ids);
      }
      const layer = GeoJSONConvert(value);
      if (layer) {
        mapRef.current?.layers.add(layer);
        if (isInitRef.current || !isEditor) {
          flyTo(layer.data?.value.geometry);
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

  const minWidth = useMemo(() => 280, []);
  const [width, setWidth] = useState<number>(minWidth);
  const [maxWidth, setMaxWidth] = useState<number>(Infinity);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const maxWidthUpdate = () => {
      const width = fieldRef.current?.getBoundingClientRect().width;
      if (width) setMaxWidth(width);
    };
    maxWidthUpdate();
    window.addEventListener("resize", maxWidthUpdate);
    return () => window.removeEventListener("resize", maxWidthUpdate);
  }, []);

  const onResize = (_: unknown, { size }: ResizeCallbackData) => {
    setWidth(size.width);
  };

  return (
    <Container>
      <GeometryField ref={fieldRef}>
        <StyledResizable
          width={width}
          minConstraints={[minWidth, 0]}
          maxConstraints={[maxWidth, 0]}
          onResize={onResize}
          handle={<span className="react-resizable-handle" />}>
          <EditorWrapper hasError={hasError} width={width}>
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
                  onClick={deleteButtonClick}
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
        </StyledResizable>
        <ViewerWrapper>
          {!disabled && (
            <StyledSearch
              allowClear
              size="small"
              placeholder={t("Search Location")}
              onSearch={handleSearch}
              loading={isSearching}
            />
          )}
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
            ref={mapRef}
            ready={isReady}
            onMount={handleMount}
            engine={"cesium"}
            meta={{ cesiumIonAccessToken: config()?.cesiumIonAccessToken }}
            viewerProperty={viewerProperty}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledResizable = styled(Resizable as any)`
  .react-resizable-handle {
    position: absolute;
    right: -5px;
    bottom: 0;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }
`;

const EditorWrapper = styled.div<{ hasError: boolean; width: number }>`
  width: ${({ width }) => `${width}px`};
  position: relative;
  border: 1px solid ${({ hasError }) => (hasError ? "#ff4d4f" : "transparent")};
  .glyphMargin {
    background: #ecabbb;
    width: 5px !important;
  }
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
  overflow: hidden;
`;

const StyledSearch = styled(Input.Search)`
  z-index: 1;
  position: absolute;
  left: 8px;
  top: 15px;
  max-width: 167px;
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
