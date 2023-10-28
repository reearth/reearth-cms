import styled from "@emotion/styled";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

import { Group } from "../types";

export interface Props {
  open: boolean;
  group?: Group;
  onClose: (refetch?: boolean) => void;
  onDelete: (groupId?: string) => Promise<void> | void;
}

const GroupDeletionModal: React.FC<Props> = ({ open, group, onClose, onDelete }) => {
  const t = useT();

  return (
    <Modal
      title={t("Delete Group")}
      open={open}
      onCancel={() => onClose()}
      footer={[
        <Button key="back" onClick={() => onClose()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={() => onDelete(group?.id)} danger>
          {t("Delete Group")}
        </Button>,
      ]}>
      <p>
        {t("Are you sure you want to delete the group")} <GroupName> {group?.name} </GroupName>?
      </p>
      <Alert
        message={t("Warning")}
        description={t(
          "This action will permanently delete the selected group and cannot be reversed.",
        )}
        type="warning"
        showIcon
      />
    </Modal>
  );
};

export default GroupDeletionModal;

const GroupName = styled.span`
  font-weight: 600;
`;
