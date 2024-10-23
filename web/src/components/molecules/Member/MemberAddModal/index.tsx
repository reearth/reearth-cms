import styled from "@emotion/styled";
import React, { useCallback, useState, useEffect } from "react";

import AutoComplete, { AutoCompleteProps } from "@reearth-cms/components/atoms/AutoComplete";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/Member/types";
import { MemberInput, Role } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  open: boolean;
  searchedUser?: User & { isMember: boolean };
  searchedUserList: User[];
  searchLoading: boolean;
  addLoading: boolean;
  onUserSearch: (nameOrEmail: string) => Promise<void>;
  onUserAdd: () => void;
  onClose: () => void;
  onSubmit: (users: MemberInput[]) => Promise<void>;
  changeSearchedUser: (user?: User & { isMember: boolean }) => void;
  changeSearchedUserList: React.Dispatch<React.SetStateAction<User[]>>;
};

type FormValues = Record<string, Role>;

const { Option } = Select;

let timeout: ReturnType<typeof setTimeout> | null;

const MemberAddModal: React.FC<Props> = ({
  open,
  searchedUser,
  searchedUserList,
  searchLoading,
  addLoading,
  onUserSearch,
  onUserAdd,
  onClose,
  onSubmit,
  changeSearchedUser,
  changeSearchedUserList,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const resultClear = useCallback(() => {
    setIsResultOpen(false);
    setOptions([]);
  }, []);

  const handleMemberNameChange = useCallback(
    (value: string) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      const search = () => {
        onUserSearch(value);
        setIsResultOpen(true);
      };
      if (value) {
        timeout = setTimeout(search, 300);
      } else {
        resultClear();
      }
    },
    [resultClear, onUserSearch],
  );

  useEffect(() => {
    if (searchedUser) {
      setOptions([
        {
          value: "",
          label: (
            <UserWrapper>
              <UserAvatar username={searchedUser.name} size={24} />
              <UserInfo>
                <UserName>{searchedUser.name}</UserName>
                <Email>{searchedUser.email}</Email>
              </UserInfo>
            </UserWrapper>
          ),
        },
      ]);
    } else {
      setOptions([]);
    }
  }, [searchedUser]);

  const handleSelect = useCallback(() => {
    onUserAdd();
    resultClear();
  }, [resultClear, onUserAdd]);

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
    const values = form.getFieldsValue();
    try {
      await onSubmit(
        searchedUserList.map(user => ({
          userId: user.id,
          role: values[user.id] ?? "READER",
        })),
      );
      changeSearchedUser(undefined);
      changeSearchedUserList([]);
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [changeSearchedUser, changeSearchedUserList, form, onClose, onSubmit, searchedUserList]);

  const handleClose = useCallback(() => {
    changeSearchedUser(undefined);
    onClose();
  }, [onClose, changeSearchedUser]);

  return (
    <StyledModal
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
        <Form form={form} layout="vertical">
          <Form.Item label={t("Email address or user name")}>
            <AutoComplete
              open={isResultOpen}
              options={options}
              popupMatchSelectWidth={433}
              notFoundContent={t("No result")}
              onSearch={handleMemberNameChange}
              onFocus={() => {
                if (options?.length) {
                  setIsResultOpen(true);
                }
              }}
              onBlur={() => {
                setIsResultOpen(false);
              }}
              onSelect={handleSelect}>
              <Search size="large" allowClear loading={searchLoading} />
            </AutoComplete>
          </Form.Item>
          <StyledFormItem label={`${t("Selected Members")} (${searchedUserList.length})`}>
            {searchedUserList.map(user => (
              <SelectedUser key={user.id}>
                <UserWrapperShrinked>
                  <UserAvatar username={user.name} size={24} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <Email>{user.email}</Email>
                  </UserInfo>
                </UserWrapperShrinked>
                <Actions>
                  <FormItemRole name={[user.id]}>
                    <Select defaultValue={"READER"} popupMatchSelectWidth={105}>
                      <Option value="OWNER">{t("Owner")}</Option>
                      <Option value="MAINTAINER">{t("Maintainer")}</Option>
                      <Option value="WRITER">{t("Writer")}</Option>
                      <Option value="READER">{t("Reader")}</Option>
                    </Select>
                  </FormItemRole>
                  <Button
                    type="text"
                    shape="circle"
                    onClick={() => handleMemberRemove(user.id)}
                    icon={<Icon icon="close" />}
                  />
                </Actions>
              </SelectedUser>
            ))}
          </StyledFormItem>
        </Form>
      )}
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
  }
  .ant-modal-header {
    padding: 16px 24px;
    margin: 0;
  }
  .ant-modal-body {
    padding: 24px;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }
  .ant-modal-footer {
    padding: 10px 16px;
    margin: 0;
  }
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0;
  .ant-form-item-control-input {
    min-height: 0;
  }
  .ant-form-item-control-input-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

const UserWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const UserWrapperShrinked = styled(UserWrapper)`
  max-width: 65%;
`;

const UserInfo = styled.div`
  max-width: calc(100% - 36px);
  display: flex;
  gap: 8px;
`;

const UserName = styled.div`
  max-width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Email = styled.div`
  font-family: "Roboto";
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectedUser = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const FormItemRole = styled(Form.Item)`
  margin: 0;
`;

export default MemberAddModal;
