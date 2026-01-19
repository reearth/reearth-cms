import { gold } from "@ant-design/colors";
import styled from "@emotion/styled";
import { useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
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
  const title = useMemo(
    () => (
      <Trans
        i18nKey={isModel ? "Delete {{name}} model?" : "Delete {{name}} group?"}
        values={{ name: data?.name }}
        components={{ u: <StyledDeleteItemName /> }}
      />
    ),
    [data?.name, isModel],
  );

  const confirmMessage = useMemo(
    () => (isModel ? t("Confirm delete model message") : t("Confirm delete group message")),
    [isModel, t],
  );

  const confirmBtnText = useMemo(
    () => (isModel ? t("Delete model") : t("Delete group")),
    [isModel, t],
  );

  return (
    <Modal
      title={
        <StyledTitle>
          <StyledIcon icon="exclamationSolid" color={gold[5]} size={22} />
          <span>{title}</span>
        </StyledTitle>
      }
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
          {confirmBtnText}
        </Button>,
      ]}>
      <p>{confirmMessage}</p>
    </Modal>
  );
};

export default DeletionModal;

const StyledDeleteItemName = styled.span`
  text-decoration: underline;
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  margin-right: 12px;
`;
