import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
  svgRender: boolean;
};

const SvgViewer: React.FC<Props> = ({ url, svgRender }) => {
  const t = useT();
  const [svgText, setSvgText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Could not fetch svg data");
        }
        const text = await res.text();
        setSvgText(text);
      } catch (err) {
        setSvgText(t("Could not display svg"));
        console.error(err);
      }
    };
    fetchData();
  }, [t, url]);

  return svgRender ? <Image src={url} alt="svg-preview" /> : <p>{svgText}</p>;
};

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default SvgViewer;
