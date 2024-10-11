import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Row from "@reearth-cms/components/atoms/Row";
import Select, { SelectProps } from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import WarningText from "@reearth-cms/components/molecules/Content/WarningText";
import { RequestItem, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../types";

type FormValues = {
  title: string;
  description: string;
  state: RequestState;
  reviewersId: string[];
  items: RequestItem[];
};

type Props = {
  open: boolean;
  requestCreationLoading: boolean;
  item: RequestItem;
  unpublishedItems: FormItem[];
  workspaceUserMembers: UserMember[];
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
};

const initialValues: FormValues = {
  title: "",
  description: "",
  state: "WAITING",
  reviewersId: [],
  items: [
    {
      itemId: "",
      version: "",
    },
  ],
};

type SelectedItem = {
  id: string;
  version?: string;
  checked?: boolean;
};

const RequestCreationModal: React.FC<Props> = ({
  open,
  requestCreationLoading,
  item,
  unpublishedItems,
  workspaceUserMembers,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [isDisabled, setIsDisabled] = useState(true);

  const reviewers: SelectProps["options"] = [];
  for (const member of workspaceUserMembers) {
    reviewers.push({
      label: member.user.name,
      value: member.userId,
    });
  }

  const handleValuesChange = useCallback(async () => {
    const hasError = await form
      .validateFields()
      .then(() => false)
      .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
    setIsDisabled(hasError);
  }, [form]);

  const handleCheckboxChange = useCallback(
    (item: FormItem, checked: boolean) => {
      setSelectedItems(prevState => ({
        ...prevState,
        [item.id]: { id: item.id, version: item.version, checked },
      }));
    },
    [setSelectedItems],
  );

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      values.items = [
        { ...item },
        ...Object.values(selectedItems)
          .filter(item => selectedItems[item.id]?.checked === true)
          .map(item => ({ itemId: item.id, version: item.version })),
      ];
      values.state = "WAITING";
      await onSubmit(values);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, item, selectedItems, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={requestCreationLoading}
      title={t("New Request")}
      cancelButtonProps={{ disabled: requestCreationLoading }}
      okButtonProps={{ disabled: isDisabled }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}>
        <Form.Item
          name="title"
          label={t("Title")}
          rules={[{ required: true, message: t("Please input the title of your request!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Description")}>
          <TextArea rows={4} showCount maxLength={100} />
        </Form.Item>
        <Form.Item
          name="reviewersId"
          label="Reviewer"
          rules={[
            {
              required: true,
              message: t("Please select a reviewer!"),
            },
          ]}>
          <Select
            filterOption={(input, option) =>
              (option?.label?.toString().toLowerCase() ?? "").includes(input.toLowerCase())
            }
            placeholder={t("Reviewer")}
            mode="multiple"
            options={reviewers}
            allowClear
          />
        </Form.Item>
        {unpublishedItems?.length !== 0 && (
          <WarningText
            text={t(
              "We found some referenced items that not published yet. Please select to add the items to the same request.",
            )}
          />
        )}
        {unpublishedItems?.map((item, index) => (
          <StyledRow key={index}>
            <StyledCheckbox
              value={selectedItems[item.id]?.checked}
              onChange={e => handleCheckboxChange(item, e.target.checked)}>
              <ReferenceItem value={item.id} status={item.status} title={item.title} />
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

export default RequestCreationModal;
