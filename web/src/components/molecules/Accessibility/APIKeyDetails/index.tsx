import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Input from "@reearth-cms/components/atoms/Input";
import Password from "@reearth-cms/components/atoms/Password";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { APIKey, KeyFormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import AccessAPITable from "../AccessAPI/AccessAPITable";

type Props = {
  apiUrl: string;
  currentProject?: Project;
  currentKey?: APIKey;
  hasPublishRight: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  initialValues: KeyFormType;
  keyId?: string;
  keyModels: Pick<Model, "name" | "id" | "key">[];
  createLoading?: boolean;
  updateLoading?: boolean;
  regenerateLoading?: boolean;
  onAPIKeyCreate: (
    name: string,
    description: string,
    publication: {
      publicModels: string[];
      publicAssets: boolean;
    },
  ) => Promise<void>;
  onAPIKeyUpdate: (
    id: string,
    name: string,
    description: string,
    publication: {
      publicModels: string[];
      publicAssets: boolean;
    },
  ) => Promise<void>;
  onAPIKeyRegenerate: (id?: string) => Promise<void>;
};

const APIKeyDetailsMolecule: React.FC<Props> = ({
  apiUrl,
  currentProject,
  currentKey,
  hasCreateRight,
  hasUpdateRight,
  hasPublishRight,
  initialValues,
  keyId,
  keyModels,
  createLoading,
  updateLoading,
  regenerateLoading,
  onAPIKeyCreate,
  onAPIKeyUpdate,
  onAPIKeyRegenerate,
}) => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const isNewKey = useMemo(() => keyId === "new", [keyId]);
  const changedModels = useRef(new Map<string, boolean>());

  const [form] = Form.useForm<KeyFormType>();
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // TODO: think about this logic
  useEffect(() => {
    if (!hasCreateRight && isNewKey) {
      setIsSaveDisabled(true);
    } else if (!hasUpdateRight && !isNewKey) {
      setIsSaveDisabled(true);
    }
  }, [hasCreateRight, hasUpdateRight, isNewKey]);

  const handleSave = useCallback(async () => {
    try {
      const id = keyId ?? "";
      const name = "";
      const description = "";
      const publication: {
        publicModels: string[];
        publicAssets: boolean;
      } = {
        publicModels: Array.from(changedModels.current.keys()),
        publicAssets: form.getFieldValue("assetPublic") || false,
      };
      if (isNewKey) {
        await onAPIKeyCreate(name, description, publication);
      } else {
        await onAPIKeyUpdate(id, name, description, publication);
      }
      changedModels.current.clear();
      setIsSaveDisabled(true);
    } catch (e) {
      console.error(e);
    }
  }, [form, isNewKey, keyId, onAPIKeyCreate, onAPIKeyUpdate]);

  const handleValuesChange = useCallback(
    (changedValues: Partial<KeyFormType>, values: KeyFormType) => {
      if (changedValues?.models) {
        const modelId = Object.keys(changedValues.models)[0];
        if (changedModels.current.has(modelId)) {
          changedModels.current.delete(modelId);
        } else {
          changedModels.current.set(modelId, changedValues.models[modelId]);
        }
      }
      if (
        initialValues.name === values.name &&
        initialValues.description === values.description &&
        initialValues.assetPublic === values.assetPublic &&
        changedModels.current.size === 0
      ) {
        setIsSaveDisabled(true);
      } else {
        setIsSaveDisabled(false);
      }
    },
    [initialValues],
  );

  return (
    <InnerContent
      title={t(
        `Accessibility / ${!isNewKey && currentKey?.name ? currentKey?.name : "New API Key"}`,
      )}
      flexChildren>
      <ContentSection>
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          <Form.Item name="name" label={t("Name")}>
            <StyledInput />
          </Form.Item>
          <Form.Item
            name="description"
            label={t("Description")}
            extra={t("You can write some here to describe this record.")}>
            <StyledTextArea />
          </Form.Item>
          {keyId && (
            <TokenFormItem
              label={t("API Key")}
              extra={t("This is your secret token, please use as your env value.")}>
              <StyledTokenInput
                data-testid="key"
                value={keyId ? currentKey?.key : ""}
                disabled
                visibilityToggle={{ visible }}
                iconRender={() => <CopyButton copyable={{ text: currentKey?.key }} />}
                prefix={
                  <Icon
                    icon={visible ? "eye" : "eyeInvisible"}
                    onClick={() => {
                      setVisible(prev => !prev);
                    }}
                  />
                }
              />
              <Button
                onClick={() => onAPIKeyRegenerate(currentKey?.id)}
                loading={regenerateLoading}>
                {t("Re-generate")}
              </Button>
            </TokenFormItem>
          )}
          <Form.Item name="permissions" label={t("Permissions")}>
            <AccessAPITable
              apiUrl={apiUrl}
              hasPublishRight={hasPublishRight}
              models={keyModels}
              isPublic={currentProject?.accessibility?.visibility === "PUBLIC"}
            />
          </Form.Item>
          <Button
            type="primary"
            disabled={isSaveDisabled}
            onClick={handleSave}
            loading={createLoading || updateLoading}>
            {t("Save changes")}
          </Button>
        </Form>
      </ContentSection>
    </InnerContent>
  );
};

export default APIKeyDetailsMolecule;

const maxWidth = "500px";

const StyledInput = styled(Input)`
  max-width: ${maxWidth};
`;

const StyledTextArea = styled(TextArea)`
  width: ${maxWidth};
`;

const TokenFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    gap: 4px;
  }
`;

const StyledTokenInput = styled(Password)`
  max-width: ${maxWidth};
  .ant-input-prefix {
    order: 1;
    margin-left: 4px;
    color: rgb(0, 0, 0, 0.45);
    transition: all 0.3s;
    :hover {
      color: rgba(0, 0, 0, 0.88);
    }
  }
  .ant-input-suffix {
    order: 2;
  }
`;
