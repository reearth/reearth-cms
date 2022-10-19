import styled from "@emotion/styled";
import React, { useCallback } from "react";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
}

export interface Props {
  open?: boolean;
  handleUserSearch: (nameOrEmail: string) => "" | Promise<any>;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (userIds: string[]) => void;
  searchedUser:
    | {
        id: string;
        name: string;
        email: string;
      }
    | undefined;
  changeSearchedUser: React.Dispatch<
    React.SetStateAction<
      | {
          id: string;
          name: string;
          email: string;
        }
      | undefined
    >
  >;
}

const initialValues: FormValues = {
  name: "",
};

const MemberAddModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  handleUserSearch,
  searchedUser,
  changeSearchedUser,
}) => {
  const t = useT();
  const { Search } = Input;
  const [form] = Form.useForm();

  const handleMemberNameChange = useCallback(
    (e: any) => {
      form.setFieldValue("name", e);
      handleUserSearch?.(e);
    },
    [handleUserSearch, form],
  );

  const handleMemberRemove = useCallback(() => {
    form.resetFields();
    changeSearchedUser(undefined);
  }, [changeSearchedUser, form]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async () => {
        if (searchedUser?.id) await onSubmit?.([searchedUser.id]);
        changeSearchedUser(undefined);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onSubmit, searchedUser?.id, onClose, changeSearchedUser]);

  const handleClose = useCallback(() => {
    form.resetFields();
    changeSearchedUser(undefined);
    onClose?.(true);
  }, [onClose, changeSearchedUser, form]);

  return (
    <Modal
      title={t("Add member")}
      visible={open}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} disabled={!searchedUser}>
          {t("Add to workspace")}
        </Button>,
      ]}>
      {open && (
        <Form title="Search user" form={form} layout="vertical" initialValues={initialValues}>
          <Form.Item name="name" label={t("Email address or user name")}>
            <Search
              size="large"
              style={{ width: "300px" }}
              onSearch={handleMemberNameChange}
              type="text"
            />
          </Form.Item>
          {searchedUser && (
            <SearchedUSerResult>
              <div>
                <Avatar
                  style={{
                    color: "#fff",
                    backgroundColor: "#3F3D45",
                    marginRight: "12px",
                  }}>
                  {searchedUser.name.charAt(0)}
                </Avatar>
                {searchedUser.name}
                <EmailContent>{searchedUser.email}</EmailContent>
              </div>
              <IconButton onClick={handleMemberRemove}>
                <Icon icon="close" />
              </IconButton>
            </SearchedUSerResult>
          )}
        </Form>
      )}
    </Modal>
  );
};

const IconButton = styled.button`
  all: unset;
  cursor: pointer;
`;

const EmailContent = styled.span`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.45);
`;

const SearchedUSerResult = styled.div`
  width: 300px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;

  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 2px;
`;

export default MemberAddModal;
