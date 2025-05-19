import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  isAssetPublic?: boolean;
  url: string;
};

const ImageViewer: React.FC<Props> = ({
  isAssetPublic = true,
  url,
  alt = "image-preview",
  ...props
}) => {
  const { getHeader } = useAuthHeader();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || isAssetPublic) return;

    let revokeUrl: string | null = null;

    const fetchProtectedImage = async () => {
      try {
        const headers = await getHeader();
        if (!headers) throw new Error("No auth headers");

        const response = await fetch(url, {
          headers: headers,
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

    if (!isAssetPublic) {
      fetchProtectedImage();
    }

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [isAssetPublic, url, getHeader]);

  if (isAssetPublic) {
    return <StyledImage src={url} alt={alt} {...props} />;
  }

  if (!blobUrl) {
    return <p>Loading image...</p>;
  }

  return <StyledImage src={blobUrl} alt={alt} {...props} />;
};

const StyledImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default ImageViewer;
