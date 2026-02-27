import styled from "@emotion/styled";

import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

export type PreviewType =
  | "CSV"
  | "GEO_3D_TILES"
  | "GEO_MVT"
  | "GEO"
  | "IMAGE_SVG"
  | "IMAGE"
  | "MODEL_3D"
  | "UNKNOWN";

type Props = {
  hasUpdateRight: boolean;
  onTypeChange: (value: PreviewType) => void;
  value?: PreviewType;
};

type PreviewTypeListItem = {
  name: string;
  value: PreviewType;
};

export const PreviewTypeSelect: React.FC<Props> = ({ hasUpdateRight, onTypeChange, value }) => {
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
    <StyledSelect disabled={!hasUpdateRight} onChange={onTypeChange} value={value}>
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
