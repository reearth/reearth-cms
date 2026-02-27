import styled from "@emotion/styled";
import MonacoEditor, { BeforeMount, OnMount } from "@monaco-editor/react";
import Ajv from "ajv";
import axios from "axios";
import { editor, Range } from "monaco-editor";
import "ol/ol.css";
import { Map, View } from "ol";
import { Attribution, defaults as defaultControls } from "ol/control";
import { GeoJSON } from "ol/format";
import { Circle, LineString, Point, Polygon } from "ol/geom";
import { fromCircle } from "ol/geom/Polygon";
import { defaults, Draw } from "ol/interaction";
import { createBox } from "ol/interaction/Draw";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { fromLonLat } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { Fill, Icon as IconStyle, Stroke, Style } from "ol/style";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import mapPinFilled from "@reearth-cms/components/atoms/Icon/Icons/mapPinFilled.svg";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Search from "@reearth-cms/components/atoms/Search";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import {
  EditorSupportedType,
  ObjectSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import schema from "./schema";

const { Text } = Typography;

const ajv = new Ajv();
const validate = ajv.compile(schema);

const LOCALSTORAGE_KEY = "disableGeometryWarning";

const GEO_TYPE_MAP = {
  ANY: "Point",
  GEOMETRYCOLLECTION: "GeometryCollection",
  LINESTRING: "LineString",
  MULTILINESTRING: "MultiLineString",
  MULTIPOINT: "MultiPoint",
  MULTIPOLYGON: "MultiPolygon",
  POINT: "Point",
  POLYGON: "Polygon",
} as const;

type DrawType = "Circle" | "LineString" | "Point" | "Polygon" | "Rectangle";

type Props = {
  disabled?: boolean;
  errorAdd?: () => void;
  errorDelete?: () => void;
  isEditor: boolean;
  onChange?: (value: string) => void;
  supportedTypes?: EditorSupportedType | ObjectSupportedType[];
  value?: null | string;
};

const GeometryItem: React.FC<Props> = ({
  disabled,
  errorAdd,
  errorDelete,
  isEditor,
  onChange,
  supportedTypes,
  value,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const [sketchType, setSketchType] = useState<DrawType>();
  const drawRef = useRef<Draw>();

  const setType = useCallback((drawType?: DrawType) => {
    setSketchType(drawType);
    if (drawRef.current) mapRef.current?.removeInteraction(drawRef.current);
    if (drawType) {
      const isRectangle = drawType === "Rectangle";
      const draw = new Draw({
        geometryFunction: isRectangle ? createBox() : undefined,
        source: new VectorSource(),
        style: {
          "fill-color": "#1677FF40",
          "stroke-color": "#1677FF",
          "stroke-line-dash": [5, 10],
          "stroke-width": 3,
        },
        type: isRectangle ? "Circle" : drawType,
      });
      drawRef.current = draw;
      mapRef.current?.addInteraction(draw);
      draw.on("drawend", event => {
        let geometry = event.feature.getGeometry();
        if (!geometry) return;
        let type = event.feature.getGeometry()?.getType();
        if (type === "Circle") {
          geometry = fromCircle(event.feature.getGeometry() as Circle);
          type = "Polygon";
        }
        const coordinates = (geometry as LineString | Point | Polygon)
          .transform("EPSG:3857", "EPSG:4326")
          .getCoordinates();
        const value = JSON.stringify({ coordinates, type }, null, 2);
        editorRef.current?.setValue(value);
        setType();
      });
    }
  }, []);

  const copyButtonClick = useCallback(() => {
    const value = editorRef.current?.getValue();
    if (value) navigator.clipboard.writeText(value);
  }, []);

  const deleteButtonClick = useCallback(() => {
    editorRef.current?.setValue("");
    setType();
  }, [setType]);

  const options = useMemo(
    () =>
      ({
        bracketPairColorization: {
          enabled: true,
        },
        folding: false,
        glyphMargin: true,
        lineNumbersMinChars: 3,
        minimap: {
          enabled: false,
        },
        readOnly: disabled || isEditor,
        readOnlyMessage: { value: t("Cannot edit in read-only editor") },
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: "on",
      }) as const,
    [disabled, isEditor, t],
  );

  const handleEditorWillMount: BeforeMount = useCallback(monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      schemas: [
        {
          fileMatch: ["*"],
          schema,
          uri: "",
        },
      ],
      schemaValidation: "error",
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
        options: {
          glyphMarginClassName: "glyphMargin",
        },
        range: new Range(startLine, 1, endLine, 1),
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
    (newValue?: string) => {
      if (newValue && supportedTypes) {
        try {
          const valueJson: {
            type?: (typeof GEO_TYPE_MAP)[keyof typeof GEO_TYPE_MAP];
          } = JSON.parse(newValue);
          const isValid = validate(valueJson);
          if (isValid && valueJson.type) {
            const convertedTypes = Array.isArray(supportedTypes)
              ? supportedTypes.map(type => GEO_TYPE_MAP[type])
              : supportedTypes === "ANY"
                ? [GEO_TYPE_MAP.POINT, GEO_TYPE_MAP.LINESTRING, GEO_TYPE_MAP.POLYGON]
                : [GEO_TYPE_MAP[supportedTypes]];
            if (convertedTypes.includes(valueJson.type)) {
              handleErrorDelete();
              return;
            }
          }
          throw new Error();
        } catch (_) {
          handleErrorAdd();
        }
      } else {
        handleErrorDelete();
      }
    },
    [handleErrorAdd, handleErrorDelete, supportedTypes],
  );

  const handleEditorOnChange = useCallback(
    (value?: string) => {
      onChange?.(value ?? "");
      typeCheck(value);
    },
    [onChange, typeCheck],
  );

  const [currentValue, setCurrentValue] = useState("");
  useEffect(() => {
    if (value === currentValue) {
      typeCheck(value);
    }
    setCurrentValue(value ?? "");
  }, [currentValue, typeCheck, value]);

  const placeholderContent = useMemo(() => {
    const key = Array.isArray(supportedTypes) ? supportedTypes[0] : (supportedTypes ?? "POINT");
    const obj: {
      coordinates?: unknown;
      geometries?: unknown;
      type: string;
    } = { type: GEO_TYPE_MAP[key] };
    if (key === "GEOMETRYCOLLECTION") {
      obj.geometries = [
        {
          coordinates: [],
          type: "Point",
        },
      ];
    } else {
      obj.coordinates = [];
    }
    return JSON.stringify(obj, null, 2);
  }, [supportedTypes]);

  const mapRef = useRef<Map>();

  useEffect(() => {
    if (mapContainerRef.current) {
      const osmLayer = new TileLayer({
        preload: Infinity,
        source: new OSM({
          attributions:
            'Map data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }),
      });

      const view = new View({
        center: [15558259.273856968, 4256979.356855129],
        zoom: 3,
      });

      const map = new Map({
        controls: defaultControls({ attribution: false, rotate: false, zoom: false }).extend([
          new Attribution({ collapsible: false }),
        ]),
        interactions: defaults({
          doubleClickZoom: false,
        }),
        layers: [osmLayer],
        target: mapContainerRef.current,
        view,
      });
      mapRef.current = map;

      return () => {
        map.setTarget(undefined);
        mapRef.current = undefined;
        isInitRef.current = true;
      };
    }
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q) return;
    setIsSearching(true);
    try {
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { format: "json", q },
      });
      if (data.length) {
        mapRef.current?.getView().animate({
          center: fromLonLat([Number(data[0].lon), Number(data[0].lat)]),
          duration: 0,
          zoom: Math.min(data[0].place_rank, 17),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleConfirm = useCallback(
    (newSketchType: DrawType) => {
      confirm({
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
        onOk() {
          setType(newSketchType);
        },
        title: t("You are entering a new value"),
      });
    },
    [confirm, setType, t],
  );

  const sketchButtonClick = useCallback(
    (newSketchType: DrawType) => {
      if (sketchType === newSketchType) {
        setType();
      } else if (value && !localStorage.getItem(LOCALSTORAGE_KEY)) {
        handleConfirm(newSketchType);
      } else {
        setType(newSketchType);
      }
    },
    [handleConfirm, setType, sketchType, value],
  );

  const handleZoom = useCallback((delta: number) => {
    const zoom = mapRef.current?.getView().getZoom();
    if (zoom) {
      mapRef.current?.getView().animate({
        duration: 200,
        zoom: zoom + delta,
      });
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    handleZoom(1);
  }, [handleZoom]);

  const handleZoomOut = useCallback(() => {
    handleZoom(-1);
  }, [handleZoom]);

  const GeoJSONConvert = useCallback((value: string) => {
    try {
      const geometry = JSON.parse(value);
      const isValid = validate(geometry);
      if (!isValid) return;
      return {
        geometry,
        type: "Feature",
      };
    } catch (_) {
      return;
    }
  }, []);

  const isInitRef = useRef(true);

  const sketch = useCallback(
    (value: string) => {
      const layers = mapRef.current?.getLayers();
      layers?.forEach((layer, index) => {
        if (index > 0) {
          mapRef.current?.removeLayer(layer);
        }
      });

      const newLayer = GeoJSONConvert(value);

      if (newLayer) {
        const features = new GeoJSON({ featureProjection: "EPSG:3857" }).readFeatures(newLayer);
        const source = new VectorSource({ features });
        const vectorLayer = new VectorLayer({
          source,
          style: new Style({
            fill: new Fill({
              color: "#00000040",
            }),
            image: new IconStyle({ color: "#000000D9", src: mapPinFilled }),
            stroke: new Stroke({
              color: "#000000D9",
              width: 2,
            }),
          }),
        });
        mapRef.current?.addLayer(vectorLayer);
        if (isInitRef.current || !isEditor) {
          const feature = source.getExtent();
          try {
            if (feature) {
              mapRef.current
                ?.getView()
                .fit(feature, { minResolution: 5, padding: [100, 100, 100, 100] });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    [GeoJSONConvert, isEditor],
  );

  useEffect(() => {
    if (value !== undefined) {
      if (typeof value === "string" && !hasError) {
        sketch(value);
      }
      isInitRef.current = false;
    }
  }, [sketch, value, hasError]);

  const minWidth = useMemo(() => 280, []);
  const [width, setWidth] = useState(minWidth);
  const [maxWidth, setMaxWidth] = useState(Infinity);
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
          handle={<span className="react-resizable-handle" />}
          maxConstraints={[maxWidth, 0]}
          minConstraints={[minWidth, 0]}
          onResize={onResize}
          width={width}>
          <EditorWrapper hasError={hasError} width={width}>
            <EditorButtons>
              <Tooltip title={t("Value copied!!")} trigger={"click"}>
                <EditorButton
                  disabled={!currentValue}
                  icon={<Icon icon="editorCopy" size={12} />}
                  onClick={copyButtonClick}
                  size="small"
                />
              </Tooltip>
              {!disabled && (
                <EditorButton
                  disabled={!currentValue}
                  icon={<Icon icon="trash" size={12} />}
                  onClick={deleteButtonClick}
                  size="small"
                />
              )}
            </EditorButtons>
            <MonacoEditor
              beforeMount={handleEditorWillMount}
              height="100%"
              language={"json"}
              onChange={handleEditorOnChange}
              onMount={handleEditorDidMount}
              onValidate={handleEditorValidation}
              options={options}
              value={currentValue}
            />
            <Placeholder isEmpty={!value}>{placeholderContent}</Placeholder>
          </EditorWrapper>
        </StyledResizable>
        <ViewerWrapper>
          {!disabled && (
            <StyledSearch
              allowClear
              loading={isSearching}
              onSearch={handleSearch}
              placeholder={t("Search Location")}
              size="small"
            />
          )}
          <ViewerButtons>
            {isEditor && !disabled && (
              <GeoButtons>
                {(supportedTypes === "POINT" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="mapPin" size={22} />}
                    onClick={() => {
                      sketchButtonClick("Point");
                    }}
                    selected={sketchType === "Point"}
                  />
                )}
                {(supportedTypes === "LINESTRING" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="lineString" size={26} />}
                    onClick={() => {
                      sketchButtonClick("LineString");
                    }}
                    selected={sketchType === "LineString"}
                  />
                )}
                {(supportedTypes === "POLYGON" || supportedTypes === "ANY") && (
                  <GeoButton
                    icon={<Icon icon="polygon" size={25} />}
                    onClick={() => {
                      sketchButtonClick("Polygon");
                    }}
                    selected={sketchType === "Polygon"}
                  />
                )}
                {supportedTypes === "ANY" && (
                  <GeoButton
                    icon={<Icon icon="circle" size={22} />}
                    onClick={() => {
                      sketchButtonClick("Circle");
                    }}
                    selected={sketchType === "Circle"}
                  />
                )}
                {supportedTypes === "ANY" && (
                  <GeoButton
                    icon={<Icon icon="rectangle" size={18} />}
                    onClick={() => {
                      sketchButtonClick("Rectangle");
                    }}
                    selected={sketchType === "Rectangle"}
                  />
                )}
              </GeoButtons>
            )}
            <ZoomButtons>
              <Button icon={<Icon icon="plus" />} onClick={handleZoomIn} />
              <Button icon={<Icon icon="minus" />} onClick={handleZoomOut} />
            </ZoomButtons>
          </ViewerButtons>
          <MapContainer className="map-container" isDrawing={!!sketchType} ref={mapContainerRef} />
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
  left: 52px;
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

const MapContainer = styled.div<{ isDrawing: boolean }>`
  width: 100%;
  height: 100%;
  cursor: ${({ isDrawing }) => (isDrawing ? "crosshair" : undefined)};
`;

const StyledSearch = styled(Search)`
  z-index: 1;
  position: absolute;
  left: 8px;
  top: 15px;
  max-width: 167px;
  .ant-input-outlined {
    height: 24px;
    border-color: #d9d9d9 !important;
    :hover {
      border-color: #1677ff !important;
    }
    :focus-within {
      box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1) !important;
    }
  }
`;

const ViewerButtons = styled.div`
  z-index: 1;
  position: absolute;
  right: 8px;
  height: calc(100% - 16px);
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
