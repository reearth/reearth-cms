import { useMemo } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { Trans, useT } from "@reearth-cms/i18n";

type Props = {
  open: boolean;
  data?: Model | Group;
  deleteLoading: boolean;
  onClose: () => void;
  onDelete: (modelId?: string) => Promise<void>;
  isModel: boolean;
};

const DeletionModal: React.FC<Props> = ({
  open,
  data,
  deleteLoading,
  onClose,
  onDelete,
  isModel,
}) => {
  const t = useT();
  const title = useMemo(() => (isModel ? t("Delete Model") : t("Delete Group")), [isModel, t]);
  const confirmation = useMemo(
    () =>
      isModel ? (
        <Trans i18nKey="Are you sure you want to delete this model" values={{ name: data?.name }} />
      ) : (
        <Trans i18nKey="Are you sure you want to delete this group" values={{ name: data?.name }} />
      ),
    [data?.name, isModel],
  );

  const description = useMemo(
    () =>
      isModel
        ? t("This action will permanently delete the selected model and cannot be reversed.")
        : t("This action will permanently delete the selected group and cannot be reversed."),
    [isModel, t],
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={deleteLoading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => onDelete(data?.id)}
          danger
          loading={deleteLoading}>
          {title}
        </Button>,
      ]}>
      <p>{confirmation}</p>
      <Alert message={t("Warning")} description={description} type="warning" showIcon />
    </Modal>
  );
};

export default DeletionModal;
