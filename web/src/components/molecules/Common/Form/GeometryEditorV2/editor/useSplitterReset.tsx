import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

import Tooltip from "@reearth-cms/components/atoms/Tooltip";

export enum SplitLayout {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

type Options = {
  layout: SplitLayout;
  /** False while the bar can't be dragged, e.g. a panel is collapsed. */
  enabled: boolean;
  hint: string;
  onReset: () => void;
};

type AreaProps = {
  onMouseDownCapture: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOut: (e: React.MouseEvent<HTMLDivElement>) => void;
};

type SplitterReset = {
  /** The positioned element whose direct child is the splitter. */
  areaRef: RefObject<HTMLDivElement | null>;
  /** The area's width (horizontal) or height (vertical); 0 until measured. */
  areaSize: number;
  areaProps: AreaProps;
  /** The hover hint; render it inside the area. */
  hintNode: ReactNode;
};

/**
 * Double-clicking a splitter's bar resets it, and hovering the bar says so. Splitters nest,
 * so only the bar of the area's own splitter counts, not a bar of one inside a panel.
 */
export function useSplitterReset({ layout, enabled, hint, onReset }: Options): SplitterReset {
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaSize, setAreaSize] = useState<number>(0);
  /** Where the hovered bar's centre sits within the area; null hides the hint. */
  const [hintOffset, setHintOffset] = useState<number | null>(null);
  const horizontal = layout === SplitLayout.HORIZONTAL;

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() =>
      setAreaSize(horizontal ? area.clientWidth : area.clientHeight),
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, [horizontal]);

  const ownBar = useCallback((e: React.MouseEvent<HTMLDivElement>): Element | null => {
    const bar = e.target instanceof Element ? e.target.closest(".ant-splitter-bar") : null;
    return bar?.parentElement?.parentElement === e.currentTarget ? bar : null;
  }, []);

  /**
   * Listens for the second press rather than `dblclick`: antd covers the splitter with a
   * drag mask on press, so `dblclick` never targets the bar.
   */
  const onMouseDownCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ownBar(e)) return;
      setHintOffset(null);
      if (e.detail !== 2 || !enabled) return;
      // Keep this press from starting a drag that would report the old size back.
      e.stopPropagation();
      onReset();
    },
    [enabled, onReset, ownBar],
  );

  // antd renders the bar itself, so the hint is anchored to a marker placed over it.
  const onMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = ownBar(e);
      if (!bar || !enabled) return;
      const area = e.currentTarget.getBoundingClientRect();
      const rect = bar.getBoundingClientRect();
      setHintOffset(
        horizontal ? rect.left - area.left + rect.width / 2 : rect.top - area.top + rect.height / 2,
      );
    },
    [enabled, horizontal, ownBar],
  );

  const onMouseOut = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = ownBar(e);
      if (bar && !(e.relatedTarget instanceof Node && bar.contains(e.relatedTarget))) {
        setHintOffset(null);
      }
    },
    [ownBar],
  );

  const hintNode = (
    <Tooltip open={hintOffset !== null} title={hint} placement="right">
      <HintAnchor horizontal={horizontal} offset={hintOffset ?? 0} />
    </Tooltip>
  );

  return {
    areaRef,
    areaSize,
    areaProps: { onMouseDownCapture, onMouseOver, onMouseOut },
    hintNode,
  };
}

const HintAnchor = styled.span<{ horizontal: boolean; offset: number }>`
  position: absolute;
  top: ${({ horizontal, offset }) => (horizontal ? "50%" : `${offset}px`)};
  left: ${({ horizontal, offset }) => (horizontal ? `${offset}px` : "50%")};
  width: 0;
  height: 0;
  pointer-events: none;
`;
