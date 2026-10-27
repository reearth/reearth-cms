import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import Splitter from "@reearth-cms/components/atoms/Splitter";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";

/** Height of the collapsed bottom panel: its header plus its top border. */
const COLLAPSED_HEIGHT = 41;

type PanelSize = number | string;
type PanelSizes = readonly [PanelSize, PanelSize];

const splitterBarOf = (target: EventTarget): Element | null =>
  target instanceof Element ? target.closest(".ant-splitter-bar") : null;

type Props = {
  /** The bottom panel is resizable while open and only a header while collapsed. */
  bottomOpen: boolean;
  top: ReactNode;
  bottom: ReactNode;
};

/**
 * The side pane's two panels, one above the other. Double-clicking the bar between them
 * splits them evenly, and hovering it says so.
 */
const SideSplit: React.FC<Props> = ({ bottomOpen, top, bottom }) => {
  const t = useT();
  // Both panels are sized explicitly: antd fills an unsized panel from the size it kept
  // from the last drag, which skews any size set here.
  const [openSizes, setOpenSizes] = useState<PanelSizes>(["55%", "45%"]);
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaHeight, setAreaHeight] = useState<number>(0);
  /** Where the hovered bar sits within the pane; null hides the hint. */
  const [barHintTop, setBarHintTop] = useState<number | null>(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => setAreaHeight(area.clientHeight));
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const sizes: readonly [PanelSize | undefined, PanelSize] = bottomOpen
    ? openSizes
    : [areaHeight ? areaHeight - COLLAPSED_HEIGHT : undefined, COLLAPSED_HEIGHT];

  /**
   * Listens for the second press rather than `dblclick`: antd covers the splitter with a
   * drag mask on press, so `dblclick` never targets the bar.
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!splitterBarOf(e.target)) return;
      setBarHintTop(null);
      if (e.detail !== 2 || !bottomOpen) return;
      // Keep this press from starting a drag that would report the old size back.
      e.stopPropagation();
      setOpenSizes(["50%", "50%"]);
    },
    [bottomOpen],
  );

  // antd renders the bar itself, so the hint is anchored to a marker placed over it.
  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = splitterBarOf(e.target);
      if (!bar || !bottomOpen) return;
      const area = e.currentTarget.getBoundingClientRect();
      const rect = bar.getBoundingClientRect();
      setBarHintTop(rect.top - area.top + rect.height / 2);
    },
    [bottomOpen],
  );

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = splitterBarOf(e.target);
    if (bar && !(e.relatedTarget instanceof Node && bar.contains(e.relatedTarget))) {
      setBarHintTop(null);
    }
  }, []);

  return (
    <Area
      ref={areaRef}
      onMouseDownCapture={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}>
      <Tooltip
        open={barHintTop !== null}
        title={t("Double-click to move back to the middle")}
        placement="right">
        <BarHintAnchor offset={barHintTop ?? 0} />
      </Tooltip>
      <StyledSplitter
        layout="vertical"
        onResize={next => {
          if (bottomOpen) setOpenSizes([next[0], next[1]]);
        }}>
        <Splitter.Panel size={sizes[0]} min={120}>
          {top}
        </Splitter.Panel>
        <Splitter.Panel
          size={sizes[1]}
          min={bottomOpen ? 160 : COLLAPSED_HEIGHT}
          max={bottomOpen ? "85%" : COLLAPSED_HEIGHT}
          resizable={bottomOpen}>
          {bottom}
        </Splitter.Panel>
      </StyledSplitter>
    </Area>
  );
};

export default SideSplit;

const Area = styled.div`
  position: relative;
  height: 100%;
`;

const BarHintAnchor = styled.span<{ offset: number }>`
  position: absolute;
  top: ${({ offset }) => offset}px;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const StyledSplitter = styled(Splitter)`
  height: 100%;
`;
