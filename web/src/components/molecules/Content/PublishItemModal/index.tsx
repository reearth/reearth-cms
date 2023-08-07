import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Row from "@reearth-cms/components/atoms/Row";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../types";

export type FormValues = {
  items: string[];
};

export type Props = {
  open?: boolean;
  itemId: string;
  unpublishedItems: FormItem[];
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (data: string[]) => Promise<void>;
};

const initialValues: FormValues = {
  items: [],
};

const PublishItemModal: React.FC<Props> = ({
  open,
  itemId,
  unpublishedItems,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

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
      await onSubmit?.([
        itemId,
        ...Object.keys(selectedItems)
          .filter(key => selectedItems[key] === true)
          .map(key => key),
      ]);
      onClose?.(true);
      form.resetFields();
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [itemId, form, onClose, onSubmit, selectedItems]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal open={open} onCancel={handleClose} onOk={handleSubmit} title={t("Publish")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {unpublishedItems?.length !== 0 && (
          <RequestWarning>
            <Icon icon="exclamationCircle" />
            <p>
              {t(
                "We found some referenced items that not been published yet. Please select to publish the items.",
              )}
            </p>
          </RequestWarning>
        )}
        {unpublishedItems?.map((item, index) => (
          <StyledRow key={index}>
            <StyledCheckbox
              value={selectedItems[item.id]}
              onChange={e => handleCheckboxChange(item.id, e.target.checked)}>
              <StyledReferenceItem>
                <ReferenceItemName>{item.id}</ReferenceItemName>
                <Badge
                  color={
                    item?.status === "PUBLIC"
                      ? "#52C41A"
                      : item?.status === "REVIEW"
                      ? "#F5222D"
                      : item?.status === "DRAFT"
                      ? "#BFBFBF"
                      : ""
                  }
                />
              </StyledReferenceItem>
            </StyledCheckbox>
          </StyledRow>
        ))}
      </Form>
    </Modal>
  );
};

const RequestWarning = styled.div`
  .anticon {
    float: left;
    margin-right: 8px;
    font-size: 16px;
    color: #faad14;
  }
  p {
    display: block;
    overflow: hidden;
    color: #000000d9;
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
    margin-top: 2px;
  }
`;

const StyledRow = styled(Row)`
  + .ant-row {
    margin-top: 10px;
  }
`;

const StyledReferenceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  justify-content: space-between;
  flex: 1;
`;

const ReferenceItemName = styled.p`
  margin: 0;
  color: #1890ff;
`;

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  width: 100%;
  .ant-checkbox + span {
    flex: 1;
  }
`;

export default PublishItemModal;
