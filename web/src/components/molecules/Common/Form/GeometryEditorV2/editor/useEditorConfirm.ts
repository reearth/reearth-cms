import { useCallback, useRef } from "react";

import { useModal } from "@reearth-cms/components/atoms/Modal";
import type { ModalFuncProps } from "@reearth-cms/components/atoms/Modal";

export type ConfirmConfig = Omit<ModalFuncProps, "icon">;
export type EditorConfirm = (config: ConfirmConfig) => void;

type EditorConfirmState = {
  readonly confirm: EditorConfirm;
  /** True from opening a dialog until it has fully closed. */
  readonly isDialogOpen: () => boolean;
};

/**
 * The editor's confirm dialogs, which remember whether one is open so the editor's
 * shortcuts can stay out of the way while it is.
 */
export function useEditorConfirm(): EditorConfirmState {
  const { confirm: openConfirm } = useModal();
  const openCount = useRef<number>(0);

  const confirm = useCallback(
    (config: ConfirmConfig) => {
      openCount.current += 1;
      openConfirm({
        ...config,
        afterClose: () => {
          openCount.current -= 1;
          config.afterClose?.();
        },
      });
    },
    [openConfirm],
  );

  const isDialogOpen = useCallback(() => openCount.current > 0, []);

  return { confirm, isDialogOpen };
}
