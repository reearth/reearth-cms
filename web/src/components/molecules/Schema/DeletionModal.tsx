import styled from "@emotion/styled";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  open: boolean;
  data?: { id: string; name: string };
  onClose: (refetch?: boolean) => void;
  onDelete: (modelId?: string) => Promise<void> | void;
  isGroup?: boolean;
};

const DeletionModal: React.FC<Props> = ({ open, data, onClose, onDelete, isGroup = false }) => {
  const t = useT();

  return (
    <Modal
      title={t(`Delete ${isGroup ? "Group" : "Model"}`)}
      open={open}
      onCancel={() => onClose()}
      footer={[
        <Button key="back" onClick={() => onClose()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={() => onDelete(data?.id)} danger>
          {t(`Delete ${isGroup ? "Group" : "Model"}`)}
        </Button>,
      ]}>
      <p>
        {t(`Are you sure you want to delete the ${isGroup ? "group" : "model"}`)}
        <Name> {data?.name} </Name>?
      </p>
      <Alert
        message={t("Warning")}
        description={t(
          `This action will permanently delete the selected ${
            isGroup ? "group" : "model"
          } and cannot be reversed.`,
        )}
        type="warning"
        showIcon
      />
    </Modal>
  );
};

export default DeletionModal;

const Name = styled.span`
  font-weight: 600;
`;
