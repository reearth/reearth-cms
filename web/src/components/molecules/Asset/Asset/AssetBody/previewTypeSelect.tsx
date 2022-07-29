import Select, {
  DefaultOptionType,
} from "@reearth-cms/components/atoms/Select";
import { CSSProperties } from "react";

export enum PreviewType {
  IMAGE = "image",
  GEO = "geo",
  GEO3D = "geo3d",
  MODEL3D = "model3d",
  SVG = "svg",
  ZIP = "zip",
}

type Props = {
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void | undefined;
  style?: CSSProperties;
  value?: PreviewType;
};

export const PreviewTypeSelect: React.FC<Props> = ({
  onTypeChange,
  style,
  value,
}) => {
  const previewTypeList = [
    { id: 1, name: "image", value: PreviewType.IMAGE },
    { id: 2, name: "geo", value: PreviewType.GEO },
    { id: 3, name: "geo3d", value: PreviewType.GEO3D },
    { id: 4, name: "model3d", value: PreviewType.MODEL3D },
    { id: 5, name: "svg", value: PreviewType.SVG },
    { id: 5, name: "zip", value: PreviewType.ZIP },
  ];
  return (
    <Select style={style} value={value} onChange={onTypeChange}>
      {previewTypeList.map((type) => (
        <Select.Option key={type.id} value={type.value}>
          {type.name}
        </Select.Option>
      ))}
    </Select>
  );
};
