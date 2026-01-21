import { Modal, ModalFuncProps } from "antd";

import { useT } from "@reearth-cms/i18n";

export default Modal;
export type { ModalFuncProps };

type CustomConfig = Omit<ModalFuncProps, "icon">;

export function useModal() {
  const t = useT();
  const { confirm, error } = Modal;

  const defaultConfig: Pick<ModalFuncProps, "icon" | "cancelText"> = {
    // icon: <StyledModalConfirmIcon icon="exclamationSolid" color={gold[5]} size={22} />,
    cancelText: t("Cancel"),
  };

  return {
    confirm: (customConfig: CustomConfig) => confirm({ ...defaultConfig, ...customConfig }),
    error: (customConfig: CustomConfig) => error({ ...defaultConfig, ...customConfig }),
  };
}
