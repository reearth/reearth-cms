import { useCallback, useEffect, useRef, useState } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";

import AllowedOrigins from "./AllowedOrigins";
import PostingSettings from "./PostingSettings";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  hasPostingRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  // TODO(public-api): posting (write) settings are not yet backed by a mutation.
  // Mirror Reading's `onPublicUpdate` contract here once the backend supports it.
  onPublicUpdate?: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
};

const PostingTab: React.FC<Props> = ({ hasPostingRight, ...editorProps }) => {
  const t = useT();

  if (!hasPostingRight) {
    return (
      <Alert
        showIcon
        type="warning"
        message={t("Not enough permissions")}
        description={t("Only Maintainer role or above can change the settings of the Post API")}
      />
    );
  }

  return <PostingEditor {...editorProps} />;
};

export default PostingTab;

type EditorProps = Omit<Props, "hasPostingRight">;

const PostingEditor: React.FC<EditorProps> = ({
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
  // Origins are shared with the AllowedOrigins editor and gate the PostingTable / warning Alert.
  const [origins, setOrigins] = useState<string[]>([]);
  const [isFormUnchanged, setIsFormUnchanged] = useState(true);
  const changedModels = useRef(new Map<string, boolean>());

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // TODO(public-api): baseline from the backend once saved origins are returned.
  const savedOrigins: string[] = [];
  const isOriginsUnchanged =
    origins.length === savedOrigins.length &&
    origins.every((origin, i) => origin === savedOrigins[i]);
  const isSaveDisabled = isFormUnchanged && isOriginsUnchanged;

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
      setIsFormUnchanged(
        initialValues.assetPublic === values.assetPublic && changedModels.current.size === 0,
      );
    },
    [initialValues],
  );

  const handleSave = useCallback(async () => {
    // TODO(public-api): also persist `origins` once backend support lands.
    if (!onPublicUpdate) return;
    try {
      const changedModelList = Array.from(changedModels.current, ([modelId, status]) => ({
        modelId,
        status,
      }));
      await onPublicUpdate(form.getFieldsValue(), changedModelList);
      changedModels.current.clear();
      setIsFormUnchanged(true);
    } catch (e) {
      console.error(e);
    }
  }, [form, onPublicUpdate]);

  return (
    <ContentSection
      description={t(
        "Post API allows anonymous users to submit data to a model without authentication.",
      )}
      headerActions={
        !isPublic && (
          <Tooltip
            title={
              isSaveDisabled ? t("Please add at least one origin to enable Post API") : undefined
            }>
            <Button
              type="primary"
              disabled={isSaveDisabled}
              onClick={handleSave}
              loading={updateLoading}>
              {t("Save changes")}
            </Button>
          </Tooltip>
        )
      }>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <AllowedOrigins origins={origins} onChange={setOrigins} />
        <Divider />
        <PostingSettings
          apiUrl={apiUrl}
          isPublic={isPublic}
          hasPublishRight={hasPublishRight}
          models={models}
          origins={origins}
        />
      </Form>
    </ContentSection>
  );
};
