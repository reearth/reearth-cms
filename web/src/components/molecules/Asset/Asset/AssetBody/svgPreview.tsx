import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

type Props = { url: string; svgRender: boolean };

const SVGPreview: React.FC<Props> = ({ url, svgRender }) => {
  const [svgText, setSvgText] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    const text = await res.text();
    setSvgText(text);
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return svgRender ? <Image src={url} alt="svg-preview" /> : <p>{svgText}</p>;
};

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default SVGPreview;
