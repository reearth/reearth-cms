import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

type SVGPreviewProps = { url: string; svgRender: boolean };

const SVGPreview: React.FC<SVGPreviewProps> = ({ url, svgRender }) => {
  const [svgText, setSvgText] = useState<string>("");

  const fetchData = useCallback(() => {
    fetch(url)
      .then((res) => res.text())
      .then((val) => {
        setSvgText(val);
      });
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>{svgRender ? <Image src={url} alt="svg-preview" /> : <p>{svgText}</p>}</>
  );
};

const Image = styled("img")`
  width: Auto;
  height: 500px;
  object-fit: contain;
`;

export default SVGPreview;
