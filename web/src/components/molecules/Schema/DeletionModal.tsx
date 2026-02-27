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
  data?: Group | Model;
  deleteLoading: boolean;
  isModel: boolean;
  onClose: () => void;
  onDelete: (modelId?: string) => Promise<void>;
  open: boolean;
};

const DeletionModal: React.FC<Props> = ({
  data,
  deleteLoading,
  isModel,
  onClose,
  onDelete,
  open,
}) => {
  const t = useT();
  const title = useMemo(
    () => (
      <Trans
        components={{ u: <StyledDeleteItemName /> }}
        i18nKey={isModel ? "Delete {{name}} model?" : "Delete {{name}} group?"}
        values={{ name: data?.name }}
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
      footer={[
        <Button disabled={deleteLoading} key="back" onClick={onClose}>
          {t("Cancel")}
        </Button>,
        <Button
          danger
          key="submit"
          loading={deleteLoading}
          onClick={() => onDelete(data?.id)}
          type="primary">
          {confirmBtnText}
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={
        <StyledTitle>
          <StyledIcon color={gold[5]} icon="exclamationSolid" size={22} />
          <span>{title}</span>
        </StyledTitle>
      }>
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
