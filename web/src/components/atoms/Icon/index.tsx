import styled from "@emotion/styled";
import svgToMiniDataURI from "mini-svg-data-uri";
import React, { ComponentProps, CSSProperties, memo, useMemo } from "react";
import { ReactSVG } from "react-svg";

import Icons from "./icons";

type Icons = keyof typeof Icons;

type Props = {
  alt?: string;
  className?: string;
  color?: string;
  icon?: string;
  onClick?: () => void;
  size?: number | string;
  style?: CSSProperties;
};

const Icon: React.FC<Props> = ({ alt, className, color, icon, onClick, size, style }) => {
  const src = useMemo(
    () => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : Icons[icon as Icons]),
    [icon],
  );
  if (!icon) return null;

  const sizeStr = typeof size === "number" ? `${size}px` : size;

  if (!src) {
    return <StyledImg alt={alt} onClick={onClick} size={sizeStr} src={icon} style={style} />;
  }

  if (typeof src === "string") {
    return (
      <StyledSvg
        className={className}
        color={color}
        onClick={onClick}
        size={sizeStr}
        src={src}
        style={style}
      />
    );
  }

  return React.createElement(src, {
    className,
    onClick,
    style: { ...style, color, fontSize: sizeStr },
  });
};

const StyledImg = styled.img<{ size?: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const SVG: React.FC<
  Pick<ComponentProps<typeof ReactSVG>, "className" | "onClick" | "src" | "style">
> = props => {
  return <ReactSVG {...props} wrapper="span" />;
};

const StyledSvg = styled(SVG)<{ color?: string; size?: string }>`
  font-size: 0;
  color: ${({ color }) => color};
  display: inline-block;
  line-height: 0;

  svg {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`;

export default memo(Icon);
