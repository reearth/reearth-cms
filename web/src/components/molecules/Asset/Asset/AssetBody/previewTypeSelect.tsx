import Select, { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import { PreviewType } from "@reearth-cms/gql/graphql-client-api";
import { CSSProperties } from "react";

type Props = {
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  style?: CSSProperties;
  value?: PreviewType;
};

export const PreviewTypeSelect: React.FC<Props> = ({ onTypeChange, style, value }) => {
  const previewTypeList = [
    { id: 1, name: "PNG/JPEG/TIFF", value: PreviewType.Image },
    {
      id: 2,
      name: "JSON/SHAPEFILE/KML/CZML",
      value: PreviewType.Geo,
    },
    { id: 3, name: "GEO3D", value: PreviewType.Geo3D },
    { id: 4, name: "MODEL3D/GLB", value: PreviewType.Model3D },
  ];
  return (
    <Select style={style} value={value} onChange={onTypeChange}>
      {previewTypeList.map(type => (
        <Select.Option key={type.id} value={type.value}>
          {type.name}
        </Select.Option>
      ))}
    </Select>
  );
};
