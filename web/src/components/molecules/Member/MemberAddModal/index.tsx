import styled from "@emotion/styled";
import React, { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input, { SearchProps } from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { MemberInput } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

interface FormValues {
  name: string;
  names: User[];
}

interface Props {
  open: boolean;
  searchedUser?: User & { isMember: boolean };
  searchedUserList: User[];
  addLoading: boolean;
  onUserSearch: (nameOrEmail: string) => Promise<void>;
  onUserAdd: () => void;
  onClose: () => void;
  onSubmit: (users: MemberInput[]) => Promise<void>;
  changeSearchedUser: (user?: User & { isMember: boolean }) => void;
  changeSearchedUserList: React.Dispatch<React.SetStateAction<User[]>>;
}

const initialValues: FormValues = {
  name: "",
  names: [],
};

const MemberAddModal: React.FC<Props> = ({
  open,
  searchedUser,
  searchedUserList,
  addLoading,
  onUserSearch,
  onUserAdd,
  onClose,
  onSubmit,
  changeSearchedUser,
  changeSearchedUserList,
}) => {
  const t = useT();
  const { Search } = Input;
  const [form] = Form.useForm<FormValues>();

  const handleMemberNameChange = useCallback<NonNullable<SearchProps["onSearch"]>>(
    (value, event) => {
      event?.preventDefault();
      form.setFieldValue("name", value);
      onUserSearch(value);
    },
    [onUserSearch, form],
  );

  const handleMemberRemove = useCallback(
    (userId: string) => {
      changeSearchedUserList((oldList: User[]) =>
        oldList.filter((user: User) => user.id !== userId),
      );
    },
    [changeSearchedUserList],
  );

  const handleSubmit = useCallback(async () => {
    if (searchedUserList.length === 0) return;
    try {
      await onSubmit(
        searchedUserList.map(user => ({
          userId: user.id,
          role: "READER",
        })),
      );
      changeSearchedUser(undefined);
      changeSearchedUserList([]);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  }, [form, searchedUserList, changeSearchedUser, changeSearchedUserList, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    form.resetFields();
    changeSearchedUser(undefined);
    onClose();
  }, [onClose, changeSearchedUser, form]);

  return (
    <Modal
      title={t("Add member")}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose} disabled={addLoading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={addLoading}
          disabled={searchedUserList.length === 0}>
          {t("Add to workspace")}
        </Button>,
      ]}>
      {open && (
        <Form title="Search user" form={form} layout="vertical" initialValues={initialValues}>
          <Form.Item name="name" label={t("Email address or user name")}>
            <Search size="large" onSearch={handleMemberNameChange} type="text" allowClear />
          </Form.Item>
          {searchedUser && (
            <SearchedUserResult>
              <SearchedUserAvatar>
                <UserAvatar username={searchedUser.name} />
              </SearchedUserAvatar>
              <SearchedUserName>{searchedUser.name}</SearchedUserName>
              <SearchedUserEmail>{searchedUser.email}</SearchedUserEmail>
              <Button
                type="text"
                shape="circle"
                onClick={onUserAdd}
                icon={<Icon icon="userAdd" />}
                disabled={searchedUser.isMember}
              />
            </SearchedUserResult>
          )}
          <StyledFormItem
            name="names"
            label={`${t("Selected Members")} (${searchedUserList.length})`}>
            {searchedUserList.map(user => (
              <SearchedUserResult key={user.id}>
                <SearchedUserAvatar>
                  <UserAvatar username={user.name} />
                </SearchedUserAvatar>
                <SearchedUserName>{user.name}</SearchedUserName>
                <SearchedUserEmail>{user.email}</SearchedUserEmail>
                <Button
                  type="text"
                  shape="circle"
                  onClick={() => handleMemberRemove(user.id)}
                  icon={<Icon icon="close" />}
                />
              </SearchedUserResult>
            ))}
          </StyledFormItem>
        </Form>
      )}
    </Modal>
  );
};

const StyledFormItem = styled(Form.Item)`
  margin-top: 16px;
`;

const SearchedUserAvatar = styled.div`
  width: 32px;
  margin-right: 8px;
`;

const SearchedUserName = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchedUserEmail = styled.div`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchedUserResult = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 8px;
  margin-bottom: 6px;
`;

export default MemberAddModal;
