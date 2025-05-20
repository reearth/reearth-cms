import styled from "@emotion/styled";
import React, { useEffect, useMemo, useState } from "react";

import { useAuthHeader } from "@reearth-cms/gql";
import { useT } from "@reearth-cms/i18n";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  isAssetPublic?: boolean;
  url: string;
};

const ImageViewer: React.FC<Props> = ({ alt = "image-preview", isAssetPublic, url, ...props }) => {
  const t = useT();
  const { getHeader } = useAuthHeader();
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!url || isAssetPublic) return;

    let revokeUrl: string | null = null;

    const fetchProtectedImage = async () => {
      try {
        const headers = await getHeader();
        if (!headers) throw new Error("No auth headers");

        const response = await fetch(url, {
          method: "GET",
          headers: headers,
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch protected image");

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        revokeUrl = objectUrl;
      } catch (err) {
        console.error(err);
      }
    };

    fetchProtectedImage();

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [isAssetPublic, url, getHeader]);

  const imageSrc = useMemo(() => (isAssetPublic ? url : blobUrl), [blobUrl, isAssetPublic, url]);

  return (
    <Container>
      {!loaded && <Loading>{t("Loading")}</Loading>}
      <Image src={imageSrc} alt={alt} onLoad={() => setLoaded(true)} hidden={!loaded} {...props} />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
`;

const Image = styled.img<{ hidden?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: ${({ hidden }) => (hidden ? "none" : "block")};
`;

const Loading = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ImageViewer;
