import { CSSProperties } from "react";

import Select, { DefaultOptionType } from "@reearth-cms/components/atoms/Select";

export type PreviewType = "GEO" | "GEO3D" | "IMAGE" | "MODEL3D";

type Props = {
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  style?: CSSProperties;
  value?: PreviewType;
};

type PreviewTypeListItem = {
  id: number;
  name: string;
  value: PreviewType;
};

export const PreviewTypeSelect: React.FC<Props> = ({ onTypeChange, style, value }) => {
  const previewTypeList: PreviewTypeListItem[] = [
    { id: 1, name: "PNG/JPEG/TIFF/SVG", value: "IMAGE" },
    {
      id: 2,
      name: "JSON/SHAPEFILE/KML/CZML",
      value: "GEO",
    },
    { id: 3, name: "GEO3D", value: "GEO3D" },
    { id: 4, name: "MODEL3D/GLB", value: "MODEL3D" },
  ];
  return (
    <Select style={style} value={value} onChange={onTypeChange}>
      {previewTypeList.map((type: PreviewTypeListItem) => (
        <Select.Option key={type.id} value={type.value}>
          {type.name}
        </Select.Option>
      ))}
    </Select>
  );
};
