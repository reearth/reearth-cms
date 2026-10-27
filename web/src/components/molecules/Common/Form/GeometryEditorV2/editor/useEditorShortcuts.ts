import type Draw from "ol/interaction/Draw";
import { useEffect } from "react";
import type { RefObject } from "react";

import type { GeoStore } from "../core/geoStore";
import { abortSketch, MapTool } from "../map/mapTools";

type Options = {
  store: GeoStore;
  tool: MapTool;
  setTool: (tool: MapTool) => void;
  drawRef: RefObject<Draw | null>;
  readOnly: boolean;
  requestClose: () => void;
  deleteShape: (id: string) => void;
};

/** Shortcuts only while this editor is open, and never while typing in a field. */
export function useEditorShortcuts({
  store,
  tool,
  setTool,
  drawRef,
  readOnly,
  requestClose,
  deleteShape,
}: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector(".ant-modal-confirm")) return;
      const target = e.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, [contenteditable='true'], .monaco-editor");
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        if (typing) return;
        e.preventDefault();
        if (tool !== MapTool.SELECT) {
          // First Esc drops an unfinished line or area; the next one leaves the tool. A
          // point never has an unfinished sketch, so its first Esc leaves at once.
          if (!abortSketch(drawRef.current)) setTool(MapTool.SELECT);
        } else if (store.getSnapshot().selectedId) {
          store.select(null);
        } else {
          requestClose();
        }
        return;
      }
      if (typing || readOnly) return;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.redo();
      } else if (e.key === "Backspace" && tool !== MapTool.SELECT) {
        e.preventDefault();
        drawRef.current?.removeLastPoint();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const selected = store.getSnapshot().selectedId;
        if (selected) {
          e.preventDefault();
          deleteShape(selected);
        }
      }
    };
    // Capture phase: runs even though the editor stops keys from bubbling to modals below.
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [deleteShape, drawRef, readOnly, requestClose, setTool, store, tool]);
}
