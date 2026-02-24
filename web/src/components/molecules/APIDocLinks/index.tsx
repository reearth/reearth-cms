import styled from "@emotion/styled";

import DocumentationLink from "./DocumentationLink";
import PlaygroundLink from "./PlaygroundLink";

type Props = {
  documentUrl: string;
  playgroundUrl: string;
};

const APIDocLinks: React.FC<Props> = ({ documentUrl, playgroundUrl }) => {
  return (
    <APIDocLinkWrapper>
      <DocumentationLink url={documentUrl} />
      <PlaygroundLink url={playgroundUrl} />
    </APIDocLinkWrapper>
  );
};

export default APIDocLinks;

const APIDocLinkWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
