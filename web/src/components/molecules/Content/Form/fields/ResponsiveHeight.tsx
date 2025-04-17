import styled from "@emotion/styled";
import { cloneElement, ReactElement, useEffect, useRef } from "react";

type Props = {
  id?: string;
  children: ReactElement;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
};

const ResponsiveHeight: React.FC<Props> = ({
  id,
  children,
  itemHeights,
  onItemHeightChange,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && onItemHeightChange) {
      const element = ref.current;
      const observer = new ResizeObserver(() => {
        onItemHeightChange(id, element?.offsetHeight ?? 0);
      });
      if (element) {
        observer.observe(element);
      }
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }
  }, [id, onItemHeightChange]);

  const itemHeight =
    itemHeights && id
      ? itemHeights[id.startsWith("version") ? id.substring(id.indexOf("_") + 1) : id]
      : undefined;

  return (
    <Wrapper itemHeight={itemHeight}>
      <div ref={ref}>{cloneElement(children, { ...props })}</div>
    </Wrapper>
  );
};

export default ResponsiveHeight;

const Wrapper = styled.div<{ itemHeight?: number }>`
  height: ${({ itemHeight }) => itemHeight && `${itemHeight}px`};
`;
