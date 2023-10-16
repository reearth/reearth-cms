import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

import { View } from "./types";

export interface Props {
  view?: View;
  open: boolean;
  onClose: (refetch?: boolean) => void;
  onDelete: (viewId?: string) => Promise<void> | void;
}

const ModelDeletionModal: React.FC<Props> = ({ open, view, onClose, onDelete }) => {
  const t = useT();

  return (
    <Modal
      open={open}
      onCancel={() => onClose()}
      footer={[
        <Button key="back" onClick={() => onClose()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={() => onDelete(view?.id)} danger>
          {t("Remove")}
        </Button>,
      ]}>
      <Alert
        message={t("Are you sure to delete this view?")}
        description={t(
          "Permanently remove the view, the contents won’t be removed, please don’t worry This action is not reversible, so please continue with caution.",
        )}
        type="warning"
        showIcon
      />
    </Modal>
  );
};

export default ModelDeletionModal;
