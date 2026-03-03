import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Row from "@reearth-cms/components/atoms/Row";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import WarningText from "@reearth-cms/components/molecules/Content/WarningText";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../types";

type FormValues = {
  items: string[];
};

type Props = {
  itemId: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: string[]) => Promise<void>;
  open: boolean;
  unpublishedItems: FormItem[];
};

const initialValues: FormValues = {
  items: [],
};

const PublishItemModal: React.FC<Props> = ({
  itemId,
  loading,
  onClose,
  onSubmit,
  open,
  unpublishedItems,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = useCallback(
    (itemId: string, checked: boolean) => {
      setSelectedItems(prevState => ({
        ...prevState,
        [itemId]: checked,
      }));
    },
    [setSelectedItems],
  );

  useEffect(() => {
    return () => {
      setSelectedItems({});
    };
  }, [setSelectedItems, onClose]);

  const handleSubmit = useCallback(async () => {
    try {
      await onSubmit([
        itemId,
        ...Object.keys(selectedItems)
          .filter(key => selectedItems[key] === true)
          .map(key => key),
      ]);
      onClose();
      form.resetFields();
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [itemId, form, onClose, onSubmit, selectedItems]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      footer={[
        <Button disabled={loading} onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button loading={loading} onClick={handleSubmit} type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}
      title={t("Publish")}>
      <Form form={form} initialValues={initialValues} layout="vertical">
        {unpublishedItems?.length !== 0 && (
          <WarningText
            text={t(
              "We found some referenced items that not been published yet. Please select to publish the items.",
            )}
          />
        )}
        {unpublishedItems?.map((item, index) => (
          <StyledRow key={index}>
            <StyledCheckbox
              onChange={e => handleCheckboxChange(item.id, e.target.checked)}
              value={selectedItems[item.id]}>
              <ReferenceItem status={item.status} title={item.title} value={item.id} />
            </StyledCheckbox>
          </StyledRow>
        ))}
      </Form>
    </Modal>
  );
};

const StyledRow = styled(Row)`
  + .ant-row {
    margin-top: 10px;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  width: 100%;
  .ant-checkbox + span {
    flex: 1;
  }
`;

export default PublishItemModal;
