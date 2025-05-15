import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
  blob?: Blob;
  svgRender: boolean;
};

const SvgViewer: React.FC<Props> = ({ url, blob, svgRender }) => {
  const t = useT();
  const [svgText, setSvgText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const text = await blob?.text();
      if (!text) {
        setSvgText(t("Could not display svg"));
        return;
      }
      setSvgText(text);
    };
    fetchData();
  }, [blob, t]);

  return svgRender ? <Image src={url} alt="svg-preview" /> : <p>{svgText}</p>;
};

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default SvgViewer;
