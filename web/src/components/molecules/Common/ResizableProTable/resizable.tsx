import type { ResizeCallbackData } from "react-resizable";

import styled from "@emotion/styled";
import { Resizable } from "react-resizable";

export type { ResizeCallbackData } from "react-resizable";

export const ResizableTitle = (
  props: {
    minWidth: number;
    onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
    width: number;
  } & React.HTMLAttributes<any>,
) => {
  const { minWidth, onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <StyledResizable
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      height={0}
      minConstraints={[minWidth, 0]}
      onResize={onResize}
      width={width}>
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
