import styled from "@emotion/styled";
import svgToMiniDataURI from "mini-svg-data-uri";
import React, { ComponentProps, CSSProperties, forwardRef, memo, useMemo } from "react";
import { ReactSVG } from "react-svg";

import { Constant } from "@reearth-cms/utils/constant";

import Icons from "./icons";

type Icons = keyof typeof Icons;

type Props = {
  className?: string;
  icon?: string;
  size?: string | number;
  alt?: string;
  color?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

const Icon = forwardRef<HTMLElement, Props>(({ className, icon, alt, style, color, size, onClick }, ref) => {
  const src = useMemo(
    () => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : Icons[icon as Icons]),
    [icon],
  );
  if (!icon) return null;

  const sizeStr = typeof size === "number" ? `${size}px` : size;

  if (!src) {
    return (
      <StyledImg ref={ref as React.Ref<HTMLImageElement>} src={icon} alt={alt} style={style} $size={sizeStr} onClick={onClick} />
    );
  }

  if (typeof src === "string") {
    return (
      <StyledSvg
        ref={ref}
        className={className}
        src={src}
        $color={color}
        style={style}
        $size={sizeStr}
        onClick={onClick}
      />
    );
  }

  return React.createElement(src, {
    ref,
    className,
    onClick,
    style: { ...style, color, fontSize: sizeStr },
  });
});

const StyledImg = styled("img", Constant.TRANSIENT_OPTIONS)<{ $size?: string }>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
`;

const SVG = forwardRef<HTMLSpanElement, Pick<ComponentProps<typeof ReactSVG>, "className" | "src" | "onClick" | "style">>(
  (props, _ref) => {
    return <ReactSVG {...props} wrapper="span" />;
  },
);

const StyledSvg = styled(SVG, Constant.TRANSIENT_OPTIONS)<{ $color?: string; $size?: string }>`
  font-size: 0;
  color: ${({ $color }) => $color};
  display: inline-block;
  line-height: 0;

  svg {
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
  }
`;

export default memo(Icon);
