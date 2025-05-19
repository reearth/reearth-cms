import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import { useAuthHeader } from "@reearth-cms/gql";
import { useT } from "@reearth-cms/i18n";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  isAssetPublic?: boolean;
  svgRender: boolean;
  url: string;
};

const SvgViewer: React.FC<Props> = ({
  alt = "image-preview",
  isAssetPublic,
  svgRender,
  url,
  ...props
}) => {
  const t = useT();
  const { getHeader } = useAuthHeader();
  const [svgText, setSvgText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = isAssetPublic ? {} : await getHeader();
        const res = await fetch(url, {
          method: "GET",
          headers,
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
  }, [getHeader, isAssetPublic, t, url]);

  if (!svgRender) {
    return <Image src={url} alt={alt} {...props} />;
  }

  if (!svgText) {
    return <p>Loading...</p>;
  }

  return <p>{svgText}</p>;
};

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default SvgViewer;
