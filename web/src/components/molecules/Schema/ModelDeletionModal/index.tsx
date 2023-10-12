import styled from "@emotion/styled";
import { useCallback } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { Model } from "@reearth-cms/components/molecules/ProjectOverview";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  open: boolean;
  model?: Model;
  setSelectedModel?: (model?: Model) => void;
  onClose: (refetch?: boolean) => void;
  onDelete: (modelId?: string) => Promise<void> | void;
}

const ModelDeletionModal: React.FC<Props> = ({
  open,
  model,
  setSelectedModel,
  onClose,
  onDelete,
}) => {
  const t = useT();

  const handleCancel = useCallback(() => {
    setSelectedModel?.(undefined);
    onClose();
  }, [onClose, setSelectedModel]);

  return (
    <Modal
      title={t("Delete Model")}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={() => onDelete(model?.id)} danger>
          {t("Delete Model")}
        </Button>,
      ]}>
      <p>
        {t("Are you sure you want to delete the model")} <ModelName> {model?.name} </ModelName>?
      </p>
      <Alert
        message={t("Warning")}
        description={t(
          "This action will permanently delete the selected model and cannot be reversed.",
        )}
        type="warning"
        showIcon
      />
    </Modal>
  );
};

export default ModelDeletionModal;

const ModelName = styled.span`
  font-weight: 600;
`;
