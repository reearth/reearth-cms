import { useCallback, useEffect, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";

import ReadingTable from "./ReadingTable";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
};

const ReadingComponent: React.FC<Props> = ({
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
    <ContentSection
      description={t(
        "Once Public API is enabled, anyone with the endpoint can read data from the model. If a model is exposed via Public API, it cannot be restricted through API Key settings.",
      )}
      headerActions={
        !isPublic && (
          <Button
            type="primary"
            disabled={isSaveDisabled}
            onClick={handleSave}
            loading={updateLoading}>
            {t("Save changes")}
          </Button>
        )
      }>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <ReadingTable
          apiUrl={apiUrl}
          hasPublishRight={hasPublishRight}
          models={models}
          isPublic={isPublic}
        />
      </Form>
    </ContentSection>
  );
};

export default ReadingComponent;
