import type { FeatureCollection } from "geojson";
import { useCallback } from "react";
import type { RefObject } from "react";

import { useT } from "@reearth-cms/i18n";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { writeFieldValue } from "../core/fieldValue";
import type { Originals } from "../core/fieldValue";
import type { GeoStore } from "../core/geoStore";
import type { GeoJsonPanelHandle } from "../panels/GeoJsonPanel";

import type { EditorConfirm } from "./useEditorConfirm";

type Options = {
  store: GeoStore;
  /** What the editor opened with; null when the stored value could not be read. */
  initialCollection: FeatureCollection | null;
  /** Original text of each stored shape, so unchanged shapes are written back verbatim. */
  originals: Originals;
  multiple: boolean;
  readOnly: boolean;
  jsonPanelRef: RefObject<GeoJsonPanelHandle | null>;
  confirm: EditorConfirm;
  onApply: (value: string | string[]) => void;
  onClose: () => void;
};

type Draft = {
  /** Cancel: closes at once when nothing changed, otherwise asks first. */
  readonly requestClose: () => void;
  /** Writes the draft into the item form, then closes. */
  readonly apply: () => void;
};

/**
 * The editor works on a draft: Apply writes it into the item form, Cancel throws it away,
 * and the item's own Save persists to the server.
 */
export function useDraft({
  store,
  initialCollection,
  originals,
  multiple,
  readOnly,
  jsonPanelRef,
  confirm,
  onApply,
  onClose,
}: Options): Draft {
  const t = useT();

  /** Flushes typed text first, so edits from the last moments count. */
  const hasChanges = useCallback((): boolean => {
    if (jsonPanelRef.current?.flush() === false) return true;
    return (
      !initialCollection ||
      !ObjectUtils.isDeepEqual(
        GeoUtils.normalize(initialCollection),
        store.getSnapshot().collection,
      )
    );
  }, [initialCollection, jsonPanelRef, store]);

  const requestClose = useCallback(() => {
    if (readOnly || !hasChanges()) {
      onClose();
      return;
    }
    confirm({
      title: t("Discard changes to this geometry?"),
      content: t("Your edits have not been applied to the item yet."),
      okText: t("Discard"),
      okButtonProps: { danger: true },
      onOk: onClose,
    });
  }, [confirm, hasChanges, onClose, readOnly, t]);

  const apply = useCallback(() => {
    // Text typed just before Apply may not have reached the store yet.
    if (jsonPanelRef.current?.flush() === false) return;
    if (hasChanges()) {
      onApply(writeFieldValue(store.getSnapshot().collection, multiple, originals));
    }
    onClose();
  }, [hasChanges, jsonPanelRef, multiple, onApply, onClose, originals, store]);

  return { requestClose, apply };
}
