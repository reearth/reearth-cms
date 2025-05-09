import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
  svgRender: boolean;
  alt?: string;
  height?: number;
};

const SvgViewer: React.FC<Props> = ({ url, svgRender, alt = "Image preview", height = 500 }) => {
  const t = useT();
  const [svgContent, setSvgContent] = useState("");

  const fetchSvgData = useCallback(async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setSvgContent(text);
    } catch (err) {
      console.error("Error fetching SVG:", err);
      setSvgContent(t("Could not display svg"));
    }
  }, [url, t]);

  useEffect(() => {
    fetchSvgData();
  }, [fetchSvgData]);

  return svgRender ? <SvgImage src={url} alt={alt} $height={height} /> : <p>{svgContent}</p>;
};

const SvgImage = styled.img<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  object-fit: contain;
`;

export default SvgViewer;
