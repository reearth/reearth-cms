import styled from "@emotion/styled";
import { Resizable } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";

export type { ResizeCallbackData } from "react-resizable";

export const ResizableTitle = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: React.HTMLAttributes<any> & {
    onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
    width: number;
    minWidth: number;
  },
) => {
  const { onResize, width, minWidth, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <StyledResizable
      width={width}
      height={0}
      minConstraints={[minWidth, 0]}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}>
      <th {...restProps} />
    </StyledResizable>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledResizable = styled(Resizable as any)`
  .react-resizable-handle {
    position: absolute;
    right: -5px;
    bottom: 0;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }

  .react-resizable {
    position: relative;
    background-clip: padding-box;
  }
`;
