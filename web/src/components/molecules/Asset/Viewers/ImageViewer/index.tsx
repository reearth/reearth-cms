import styled from "@emotion/styled";

type Props = {
  url: string;
  alt?: string;
  height?: number;
};

const ImageViewer: React.FC<Props> = ({ url, alt = "Image preview", height = 500 }) => {
  return <StyledImage src={url} alt={alt} $height={height} />;
};

const StyledImage = styled.img<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  object-fit: contain;
`;

export default ImageViewer;
