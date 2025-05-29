import { useState, useEffect, useRef, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import AccessAPITable from "./AccessAPITable";

type Props = {
  isPublic: boolean;
  initialValues: FormType;
  models: Pick<Model, "id" | "name" | "key">[];
  hasPublishRight: boolean;
  updateLoading: boolean;
  apiUrl: string;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
};

const AccessAPIComponent: React.FC<Props> = ({
  isPublic,
  initialValues,
  models,
  hasPublishRight,
  updateLoading,
  apiUrl,
  onPublicUpdate,
}) => {
  const t = useT();
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const [form] = Form.useForm<FormType>();
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const changedModels = useRef(new Map<string, boolean>());

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormType>, values: FormType) => {
      if (changedValues?.models) {
        const modelId = Object.keys(changedValues.models)[0];
        if (changedModels.current.has(modelId)) {
          changedModels.current.delete(modelId);
        } else {
          changedModels.current.set(modelId, changedValues.models[modelId]);
        }
      }
      if (
        initialValues.scope === values.scope &&
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

  const handleSave = useCallback(async () => {
    try {
      await onPublicUpdate(
        form.getFieldsValue(),
        Array.from(changedModels.current, ([modelId, status]) => ({
          modelId,
          status,
        })),
      );
      changedModels.current.clear();
      setIsSaveDisabled(true);
    } catch (e) {
      console.error(e);
    }
  }, [form, onPublicUpdate]);

  return (
    <ContentSection title="Open API">
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <AccessAPITable
          apiUrl={apiUrl}
          hasPublishRight={hasPublishRight}
          models={models}
          isPublic={isPublic}
        />
        {!isPublic && <Button
          type="primary"
          disabled={isSaveDisabled}
          onClick={handleSave}
          loading={updateLoading}>
          {t("Save changes")}
        </Button>}
      </Form>
    </ContentSection>
  );
};

export default AccessAPIComponent;
