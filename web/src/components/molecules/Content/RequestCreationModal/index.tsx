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
  description: string;
  items: RequestItem[];
  reviewersId: string[];
  state: RequestState;
  title: string;
};

type Props = {
  item: RequestItem;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  open: boolean;
  requestCreationLoading: boolean;
  unpublishedItems: FormItem[];
  workspaceUserMembers: UserMember[];
};

const initialValues: FormValues = {
  description: "",
  items: [
    {
      itemId: "",
      version: "",
    },
  ],
  reviewersId: [],
  state: "WAITING",
  title: "",
};

type SelectedItem = {
  checked?: boolean;
  id: string;
  version?: string;
};

const RequestCreationModal: React.FC<Props> = ({
  item,
  onClose,
  onSubmit,
  open,
  requestCreationLoading,
  unpublishedItems,
  workspaceUserMembers,
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
        [item.id]: { checked, id: item.id, version: item.version },
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
      cancelButtonProps={{ disabled: requestCreationLoading }}
      confirmLoading={requestCreationLoading}
      okButtonProps={{ disabled: isDisabled }}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={open}
      title={t("New Request")}>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onValuesChange={handleValuesChange}>
        <Form.Item
          label={t("Title")}
          name="title"
          rules={[{ message: t("Please input the title of your request!"), required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("Description")} name="description">
          <TextArea maxLength={100} rows={4} showCount />
        </Form.Item>
        <Form.Item
          label="Reviewer"
          name="reviewersId"
          rules={[
            {
              message: t("Please select a reviewer!"),
              required: true,
            },
          ]}>
          <Select
            allowClear
            filterOption={(input, option) =>
              (option?.label?.toString().toLowerCase() ?? "").includes(input.toLowerCase())
            }
            mode="multiple"
            options={reviewers}
            placeholder={t("Reviewer")}
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
              onChange={e => handleCheckboxChange(item, e.target.checked)}
              value={selectedItems[item.id]?.checked}>
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

export default RequestCreationModal;
