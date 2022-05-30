import { Button, Form, Input, Modal } from "antd";
import React, { useCallback, useState } from "react";

export interface FormValues {
  name: string;
}

export interface Props {
  open?: boolean;
  handleUserSearch: (nameOrEmail: string) => "" | Promise<any>;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: () => void;
  searchedUser:
    | {
        id: string;
        name: string;
        email: string;
      }
    | undefined;
}

const initialValues: FormValues = {
  name: "",
};

const MemberCreationModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  handleUserSearch,
  searchedUser,
}) => {
  const { Search } = Input;
  const [form] = Form.useForm();
  const [memberName, setMemberName] = useState("");

  const handleMemberNameChange = useCallback(
    (e: any) => {
      setMemberName?.(e);
      handleUserSearch?.(e);
    },
    [setMemberName, handleUserSearch]
  );

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        console.log(values);

        if (searchedUser?.id) await onSubmit?.();
        // onClose?.(true);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, onSubmit, searchedUser?.id]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal
      title="Add member"
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}
    >
      {open && (
        <Form
          title="Search user"
          form={form}
          layout="vertical"
          initialValues={initialValues}
        >
          <Form.Item name="name" label="Email address or user name">
            <Search
              style={{ width: "300px" }}
              value={memberName}
              onSearch={handleMemberNameChange}
              type="text"
            />
          </Form.Item>
          {searchedUser && (
            <Button style={{ width: "300px" }}>{searchedUser.name}</Button>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default MemberCreationModal;
