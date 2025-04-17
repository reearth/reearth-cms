import styled from "@emotion/styled";
import React, { useCallback, useState, useEffect, useRef } from "react";

import AutoComplete from "@reearth-cms/components/atoms/AutoComplete";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User, Role } from "@reearth-cms/components/molecules/Member/types";
import { UserMember, MemberInput } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  open: boolean;
  workspaceUserMembers?: UserMember[];
  searchLoading: boolean;
  addLoading: boolean;
  onUserSearch: (nameOrEmail: string) => Promise<User[]>;
  onClose: () => void;
  onSubmit: (users: MemberInput[]) => Promise<void>;
};

type FormValues = { search: string } & Record<string, Role>;

const { Option } = Select;

const MemberAddModal: React.FC<Props> = ({
  open,
  workspaceUserMembers,
  searchLoading,
  addLoading,
  onUserSearch,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [options, setOptions] = useState<
    {
      value: string;
      user: User;
      label: JSX.Element;
    }[]
  >([]);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const resultClear = useCallback(() => {
    setIsResultOpen(false);
    setOptions([]);
  }, []);

  const timeout = useRef<ReturnType<typeof setTimeout> | null>();

  const handleMemberNameChange = useCallback(
    (value: string) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      const search = async () => {
        setIsResultOpen(true);
        if (value.length > 2) {
          try {
            const users = await onUserSearch(value);
            const newUsers: User[] = [];
            users.forEach(user => {
              const isMember = !!workspaceUserMembers?.some(member => member.userId === user.id);
              const isSelected = selectedUsers.some(selectedUser => selectedUser.id === user.id);
              if (!isMember && !isSelected) {
                newUsers.push(user);
              }
            });
            setSearchedUsers(newUsers);
          } catch (e) {
            console.error(e);
            setSearchedUsers([]);
          }
        } else {
          setSearchedUsers([]);
        }
      };
      if (value) {
        timeout.current = setTimeout(search, 300);
      } else {
        resultClear();
      }
    },
    [onUserSearch, setSearchedUsers, workspaceUserMembers, selectedUsers, resultClear],
  );

  useEffect(() => {
    if (searchedUsers.length) {
      const options = searchedUsers.map(user => ({
        value: user.id,
        user,
        label: (
          <UserWrapper>
            <UserAvatar username={user.name} size={24} />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <Email>{user.email}</Email>
            </UserInfo>
          </UserWrapper>
        ),
      }));
      setOptions(options);
    } else {
      setOptions([]);
    }
  }, [searchedUsers]);

  const handleUserAdd = useCallback(
    (user: User) => {
      setSelectedUsers(prev => [...prev, user]);
    },
    [setSelectedUsers],
  );

  const handleSelect = useCallback(
    (user: User) => {
      handleUserAdd(user);
      resultClear();
      form.resetFields(["search"]);
    },
    [handleUserAdd, resultClear, form],
  );

  const handleMemberRemove = useCallback(
    (userId: string) => {
      setSelectedUsers(prev => prev.filter(user => user.id !== userId));
    },
    [setSelectedUsers],
  );

  const handleSubmit = useCallback(async () => {
    if (selectedUsers.length === 0) return;
    const values = form.getFieldsValue();
    try {
      await onSubmit(
        selectedUsers.map(user => ({
          userId: user.id,
          role: values[user.id] ?? "READER",
        })),
      );
      setSearchedUsers([]);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [setSelectedUsers, form, onClose, onSubmit, selectedUsers, setSearchedUsers]);

  const handleClose = useCallback(() => {
    setSearchedUsers([]);
    onClose();
  }, [onClose, setSearchedUsers]);

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
          disabled={selectedUsers.length === 0}>
          {t("Add to workspace")}
        </Button>,
      ]}>
      {open && (
        <Form form={form} layout="vertical">
          <Form.Item label={t("Search user")} name="search">
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
              onSelect={(_, option) => {
                handleSelect(option.user);
              }}>
              <Search
                size="large"
                allowClear
                loading={searchLoading}
                placeholder={t("Email address or user name")}
              />
            </AutoComplete>
          </Form.Item>
          <StyledFormItem label={`${t("Selected Members")} (${selectedUsers.length})`}>
            {selectedUsers.map(user => (
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
