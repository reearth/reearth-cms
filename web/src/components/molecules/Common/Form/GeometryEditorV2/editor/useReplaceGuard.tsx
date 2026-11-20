import { useCallback } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import type { GeoStore } from "../core/geoStore";

import type { EditorConfirm } from "./useEditorConfirm";
import { useUndoNotice } from "./useUndoNotice";

const { DISABLE_GEOMETRY_WARNING } = Constant.LOCAL_STORAGE_KEY;

const isWarningDisabled = (): boolean => {
  try {
    return localStorage.getItem(DISABLE_GEOMETRY_WARNING) === "true";
  } catch {
    return false;
  }
};

const setWarningDisabled = (disabled: boolean) => {
  try {
    if (disabled) localStorage.setItem(DISABLE_GEOMETRY_WARNING, "true");
    else localStorage.removeItem(DISABLE_GEOMETRY_WARNING);
  } catch {
    // Preferences are a convenience; ignore storage failures.
  }
};

type ReplaceGuard = {
  /** Runs `proceed` at once, or after the user confirms replacing the single value. */
  readonly confirmReplace: (proceed: () => void) => void;
  /** Tells the user a single value was replaced, with a way back. */
  readonly notifyReplaced: () => void;
};

/** Single-value fields replace their value; warn once, as the legacy field does. */
export function useReplaceGuard(
  store: GeoStore,
  multiple: boolean,
  hasValue: boolean,
  confirm: EditorConfirm,
): ReplaceGuard {
  const t = useT();
  const showUndoNotice = useUndoNotice(store);

  const confirmReplace = useCallback(
    (proceed: () => void) => {
      if (multiple || !hasValue || isWarningDisabled()) {
        proceed();
        return;
      }
      confirm({
        title: t("You are entering a new value"),
        content: (
          <div>
            <p>
              {t("This action will replace the previously entered value. Do you want to continue?")}
            </p>
            <Checkbox onChange={e => setWarningDisabled(e.target.checked)}>
              {t("Do not show this again")}
            </Checkbox>
          </div>
        ),
        okText: t("Continue"),
        onOk: proceed,
      });
    },
    [confirm, hasValue, multiple, t],
  );

  // The confirm dialog can be switched off, so this notice always tells the user.
  const notifyReplaced = useCallback(
    () =>
      showUndoNotice({
        message: t("Replaced the previous geometry"),
        description: t("This field holds one geometry."),
        duration: 5,
      }),
    [showUndoNotice, t],
  );

  return { confirmReplace, notifyReplaced };
}
