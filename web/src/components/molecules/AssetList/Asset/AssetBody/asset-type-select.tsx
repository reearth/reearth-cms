import Select from "@reearth-cms/components/atoms/Select";
import { DefaultOptionType } from "antd/lib/select";
import { CSSProperties } from "react";

export enum AssetType {
  PNG = "png",
  JPEG = "jpeg",
  TIFF = "tiff",
  JSON = "json",
  CSV = "csv",
  GEOJSON = "geojson",
  TOPJSON = "topojson",
  SHAPEFILE = "shapefile",
  KML = "kml",
  CZML = "czml",
  GML = "gml",
  GLB = "glb",
  ZIP = "zip",
  SVG = "svg",
}

type AssetTypeSelectProps = {
  onTypeChange: (
    value: AssetType,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void | undefined;
  style?: CSSProperties;
  value?: AssetType;
};

export const AssetTypeSelect: React.FC<AssetTypeSelectProps> = ({
  onTypeChange,
  style,
  value,
}) => {
  const assetTypeList = [
    { id: 1, name: "png", value: AssetType.PNG },
    { id: 2, name: "jpeg", value: AssetType.JPEG },
    { id: 3, name: "tiff", value: AssetType.TIFF },
    { id: 4, name: "json", value: AssetType.JSON },
    { id: 5, name: "csv", value: AssetType.CSV },
    { id: 6, name: "geojson", value: AssetType.GEOJSON },
    { id: 7, name: "topojson", value: AssetType.TOPJSON },
    { id: 8, name: "shapefile", value: AssetType.SHAPEFILE },
    { id: 9, name: "kml", value: AssetType.KML },
    { id: 10, name: "czml", value: AssetType.CZML },
    { id: 11, name: "gml", value: AssetType.GML },
    { id: 12, name: "glb", value: AssetType.GLB },
    { id: 13, name: "zip", value: AssetType.ZIP },
    { id: 14, name: "svg", value: AssetType.SVG },
  ];
  return (
    <Select style={style} value={value} onChange={onTypeChange}>
      {assetTypeList.map((type) => (
        <Select.Option key={type.id} value={type.value}>
          {type.name}
        </Select.Option>
      ))}
    </Select>
  );
};
