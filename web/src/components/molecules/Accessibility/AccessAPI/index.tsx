import styled from "@emotion/styled";
import { useState, useEffect, useRef, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import AccessAPITable from "./AccessAPITable";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  onAPIKeyEdit: (keyId?: string) => void;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
};

const AccessAPIComponent: React.FC<Props> = ({
  apiUrl,
  isPublic,
  initialValues,
  hasPublishRight,
  models,
  updateLoading,
  onPublicUpdate,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const changedModels = useRef(new Map<string, boolean>());

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormType>, values: FormType) => {
      if (changedValues.models) {
        const modelId = Object.keys(changedValues.models)[0];
        if (changedModels.current.has(modelId)) {
          changedModels.current.delete(modelId);
        } else {
          changedModels.current.set(modelId, changedValues.models[modelId]);
        }
      }
      if (initialValues.assetPublic === values.assetPublic && changedModels.current.size === 0) {
        setIsSaveDisabled(true);
      } else {
        setIsSaveDisabled(false);
      }
    },
    [initialValues],
  );

  const handleSave = useCallback(async () => {
    try {
      const changedModelList = Array.from(changedModels.current, ([modelId, status]) => ({
        modelId,
        status,
      }));
      await onPublicUpdate(form.getFieldsValue(), changedModelList);
      changedModels.current.clear();
      setIsSaveDisabled(true);
    } catch (e) {
      console.error(e);
    }
  }, [form, onPublicUpdate]);

  return (
    <ContentSection title={t("Access API")}>
      <Paragraph>
        {t(
          "Once Access API is enabled, anyone with the endpoint can access it. If a model is exposed via Access API, it cannot be restricted through API Key settings.",
        )}
      </Paragraph>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <AccessAPITable
          apiUrl={apiUrl}
          hasPublishRight={hasPublishRight}
          models={models}
          isPublic={isPublic}
        />
        {!isPublic && (
          <Button
            type="primary"
            disabled={isSaveDisabled}
            onClick={handleSave}
            loading={updateLoading}>
            {t("Save changes")}
          </Button>
        )}
      </Form>
    </ContentSection>
  );
};

export default AccessAPIComponent;

const Paragraph = styled.p`
  color: #8c8c8c;
  padding-bottom: 16px;
`;
