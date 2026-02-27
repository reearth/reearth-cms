import styled from "@emotion/styled";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Radio from "@reearth-cms/components/atoms/Radio";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import useHook from "@reearth-cms/components/molecules/ProjectSettings/hook";
import { getLicenseContent, license_options } from "@reearth-cms/data/license";
import { ProjectVisibility } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

export type FormValues = {
  alias: string;
  description: string;
  license: string;
  name: string;
  visibility: ProjectVisibility;
};

type Props = {
  onClose: () => void;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onSubmit: (values: FormValues) => Promise<void>;
  open: boolean;
  privateProjectsAllowed?: boolean;
};

const initialValues: FormValues = {
  alias: "",
  description: "",
  license: "",
  name: "",
  visibility: ProjectVisibility.Public,
};

const ProjectCreationModal: React.FC<Props> = ({
  onClose,
  onProjectAliasCheck,
  onSubmit,
  open,
  privateProjectsAllowed,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const { aliasValidate } = useHook(onProjectAliasCheck);

  const timeout = useRef<null | ReturnType<typeof setTimeout>>(null);
  const values = Form.useWatch<FormValues | undefined>([], form);
  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (!values?.name && !values?.alias) {
      setIsDisabled(true);
      return;
    }
    const validate = () => {
      form
        .validateFields()
        .then(() => setIsDisabled(false))
        .catch(() => setIsDisabled(true));
    };
    timeout.current = setTimeout(validate, 300);
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [form, values]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyAutoFill(e, { form, key: "alias" });
    },
    [form],
  );

  const handleAliasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyReplace(e, { form, key: "alias" });
    },
    [form],
  );

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    form.resetFields();
    setIsDisabled(true);
  }, [form, onClose]);

  return (
    <Modal
      footer={[
        <Button disabled={isLoading} key="cancel" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={isDisabled}
          key="ok"
          loading={isLoading}
          onClick={handleSubmit}
          type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}>
      <Form form={form} initialValues={initialValues} layout="vertical" validateTrigger="">
        <Form.Item
          label={t("Project name")}
          name="name"
          rules={[{ message: t("Please input the name of project!"), required: true }]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        <Form.Item
          extra={t(
            "Used to create the project URL. Must be unique and at least {{min}} characters long, only lowercase letters, numbers, and hyphens are allowed.",
            { min: Constant.PROJECT_ALIAS.MIN_LENGTH },
          )}
          label={t("Project alias")}
          name="alias"
          rules={[{ validator: async (_, value) => await aliasValidate(value) }]}>
          <Input
            maxLength={Constant.PROJECT_ALIAS.MAX_LENGTH}
            onChange={handleAliasChange}
            showCount
          />
        </Form.Item>
        <Form.Item
          extra={t(
            "Public projects are visible to everyone. Private projects are only accessible to workspace members.",
          )}
          label={t("Project visibility")}
          name="visibility"
          rules={[
            { message: t("Please choose the visibility settings of the project!"), required: true },
          ]}>
          <StyledRadioGroup defaultValue={ProjectVisibility.Public}>
            <Radio value={ProjectVisibility.Public}>{t("Public")}</Radio>
            <Radio disabled={!privateProjectsAllowed} value={ProjectVisibility.Private}>
              {t("Private")}
            </Radio>
          </StyledRadioGroup>
        </Form.Item>
        <Form.Item label={t("Project description")} name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label={t("Project license")} name="license">
          <Select>
            {license_options?.map(option => (
              <Select.Option key={option.value} value={getLicenseContent(option.value)}>
                <Tooltip title={option.description}>
                  <span>{option.label}</span>
                </Tooltip>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectCreationModal;

const StyledRadioGroup = styled(Radio.Group)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
