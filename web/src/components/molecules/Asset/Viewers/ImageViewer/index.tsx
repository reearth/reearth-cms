import styled from "@emotion/styled";
import { useState } from "react";

import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
};

const ImageViewer: React.FC<Props> = ({ url }) => {
  const t = useT();
  const [loaded, setLoaded] = useState(false);

  return (
    <Container>
      {!loaded && <Placeholder>{t("Loading")}</Placeholder>}
      <Image
        src={url}
        alt="image-preview"
        style={{ display: loaded ? "block" : "none" }}
        onLoad={() => setLoaded(true)}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ImageViewer;
