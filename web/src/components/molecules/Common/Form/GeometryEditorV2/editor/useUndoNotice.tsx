import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Notification from "@reearth-cms/components/atoms/Notification";
import { useT } from "@reearth-cms/i18n";

import type { GeoStore } from "../core/geoStore";

type UndoNotice = {
  readonly message: string;
  readonly description?: string;
  /** Seconds before the notice closes itself. */
  readonly duration: number;
};

/** A notice after a destructive edit, with an Undo button that reverts it. */
export function useUndoNotice(store: GeoStore): (notice: UndoNotice) => void {
  const t = useT();

  return useCallback(
    ({ message, description, duration }: UndoNotice) => {
      const key = `geometry-undo-${Date.now()}`;
      Notification.info({
        key,
        message,
        description,
        placement: "bottomLeft",
        duration,
        btn: (
          <Button
            size="small"
            onClick={() => {
              store.undo();
              Notification.destroy(key);
            }}>
            {t("Undo")}
          </Button>
        ),
      });
    },
    [store, t],
  );
}
