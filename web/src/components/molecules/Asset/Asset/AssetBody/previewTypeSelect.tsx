import styled from "@emotion/styled";

import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

export type PreviewType =
  | "GEO"
  | "GEO_3D_TILES"
  | "GEO_MVT"
  | "IMAGE"
  | "IMAGE_SVG"
  | "MODEL_3D"
  | "CSV"
  | "UNKNOWN";

type Props = {
  onTypeChange: (value: PreviewType) => void;
  value?: PreviewType;
  hasUpdateRight: boolean;
};

type PreviewTypeListItem = {
  name: string;
  value: PreviewType;
};

export const PreviewTypeSelect: React.FC<Props> = ({ onTypeChange, value, hasUpdateRight }) => {
  const t = useT();
  const previewTypeList: PreviewTypeListItem[] = [
    { name: t("PNG/JPEG/TIFF/GIF"), value: "IMAGE" },
    { name: t("SVG"), value: "IMAGE_SVG" },
    {
      name: t("GEOJSON/KML/CZML"),
      value: "GEO",
    },
    { name: t("3D Tiles"), value: "GEO_3D_TILES" },
    { name: t("MVT"), value: "GEO_MVT" },
    { name: t("GLTF/GLB"), value: "MODEL_3D" },
    { name: t("CSV"), value: "CSV" },
    { name: t("Unknown Type"), value: "UNKNOWN" },
  ];
  return (
    <StyledSelect value={value} onChange={onTypeChange} disabled={!hasUpdateRight}>
      {previewTypeList.map((type, index) => (
        <Select.Option key={index} value={type.value}>
          {type.name}
        </Select.Option>
      ))}
    </StyledSelect>
  );
};

const StyledSelect = styled(Select<PreviewType>)`
  width: 80%;
`;
