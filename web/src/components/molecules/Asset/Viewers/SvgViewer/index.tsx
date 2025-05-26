import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import { useAuthHeader } from "@reearth-cms/gql";
import { useT } from "@reearth-cms/i18n";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
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
  const [blobUrl, setBlobUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

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
        const blob = new Blob([text], { type: "image/svg+xml" });
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        setSvgText(t("Could not display svg"));
        setLoaded(true);
        console.error(err);
      }
    };

    if (!svgText && !blobUrl) {
      fetchData();
    }
  }, [blobUrl, getHeader, isAssetPublic, svgRender, svgText, t, url]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <MainContainer>
      {!loaded && <LoadingContainer>{t("Loading")}</LoadingContainer>}
      {svgRender ? (
        <StyledImage
          alt={alt}
          src={isAssetPublic ? url : blobUrl}
          onLoad={() => setLoaded(true)}
          hidden={!loaded}
          {...props}
        />
      ) : (
        <TextContent hidden={!loaded}>{svgText}</TextContent>
      )}
    </MainContainer>
  );
};

const MainContainer = styled.div`
  width: 100%;
  height: 500px;
`;

const StyledImage = styled.img<{ hidden?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: ${({ hidden }) => (hidden ? "none" : "block")};
`;

const TextContent = styled.pre<{ hidden?: boolean }>`
  width: 100%;
  height: 100%;
  margin: 0;
  white-space: pre-wrap;
  overflow: auto;
  display: ${({ hidden }) => (hidden ? "none" : "block")};
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SvgViewer;
