import { useCallback, useEffect, useRef, useState } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { PostingFormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";

import AllowedOrigins from "./AllowedOrigins";
import PostingSettings from "./PostingSettings";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: PostingFormType;
  savedOrigins: string[];
  hasPublishRight: boolean;
  hasPostingRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  onPostingUpdate: (
    origins: string[],
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
  savedOrigins,
  hasPublishRight,
  models,
  updateLoading,
  onPostingUpdate,
}) => {
  const t = useT();
  const [form] = Form.useForm<PostingFormType>();
  // Origins are shared with the AllowedOrigins editor and gate the PostingTable / warning Alert.
  const [origins, setOrigins] = useState<string[]>(savedOrigins);
  const [isFormUnchanged, setIsFormUnchanged] = useState(true);
  const changedModels = useRef(new Map<string, boolean>());

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // Re-baseline the origins editor whenever the saved value changes (e.g. after a successful save).
  useEffect(() => {
    setOrigins(savedOrigins);
  }, [savedOrigins]);

  const isOriginsUnchanged =
    origins.length === savedOrigins.length &&
    origins.every((origin, i) => origin === savedOrigins[i]);
  const isSaveDisabled = isFormUnchanged && isOriginsUnchanged;

  const handleValuesChange = useCallback((changedValues: Partial<PostingFormType>) => {
    if (changedValues.models) {
      const modelId = Object.keys(changedValues.models)[0];
      if (changedModels.current.has(modelId)) {
        changedModels.current.delete(modelId);
      } else {
        changedModels.current.set(modelId, changedValues.models[modelId]);
      }
    }
    setIsFormUnchanged(changedModels.current.size === 0);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const changedModelList = Array.from(changedModels.current, ([modelId, status]) => ({
        modelId,
        status,
      }));
      await onPostingUpdate(origins, changedModelList);
      changedModels.current.clear();
      setIsFormUnchanged(true);
    } catch (e) {
      console.error(e);
    }
  }, [onPostingUpdate, origins]);

  return (
    <ContentSection
      description={t(
        "Post API allows anonymous users to submit data to a model without authentication.",
      )}
      headerActions={
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
