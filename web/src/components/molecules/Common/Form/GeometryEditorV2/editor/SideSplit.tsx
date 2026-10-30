import styled from "@emotion/styled";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import Splitter from "@reearth-cms/components/atoms/Splitter";
import { useT } from "@reearth-cms/i18n";

import { SplitLayout, useSplitterReset } from "./useSplitterReset";

/** Height of the collapsed bottom panel: its header plus its top border. */
const COLLAPSED_HEIGHT = 41;

type PanelSize = number | string;
type PanelSizes = readonly [PanelSize, PanelSize];

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
  const resetSizes = useCallback<() => void>(() => setOpenSizes(["50%", "50%"]), []);
  const { areaRef, areaSize, areaProps, hintNode } = useSplitterReset({
    layout: SplitLayout.VERTICAL,
    enabled: bottomOpen,
    hint: t("Double-click to move back to the middle"),
    onReset: resetSizes,
  });

  const sizes: readonly [PanelSize | undefined, PanelSize] = bottomOpen
    ? openSizes
    : [areaSize ? areaSize - COLLAPSED_HEIGHT : undefined, COLLAPSED_HEIGHT];

  return (
    <Area ref={areaRef} {...areaProps}>
      {hintNode}
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

const StyledSplitter = styled(Splitter)`
  height: 100%;
`;
