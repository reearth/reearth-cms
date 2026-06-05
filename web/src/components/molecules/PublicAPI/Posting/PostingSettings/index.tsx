import styled from "@emotion/styled";
import { Alert } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style.ts";

import PostingTable from "./PostingTable";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  origins?: string[];
  // TODO(public-api): posting (write) settings are not yet backed by a mutation.
  // Mirror Reading's `onPublicUpdate` contract here once the backend supports it.
  onPublicUpdate?: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
};

const PostingComponent: React.FC<Props> = ({
  apiUrl,
  isPublic,
  initialValues,
  hasPublishRight,
  models,
  updateLoading,
  origins,
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
    // TODO(public-api): wire to the posting (write) mutation once backend support lands.
    if (!onPublicUpdate) return;
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
    <ContentSection>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Paragraph>
          {t("Post API allows anonymous users to submit data to a model without authentication.")}
        </Paragraph>

        {!origins?.length && (
          <Alert
            showIcon
            description="Please add at least one origin to enable Post API"
            type="warning"
          />
        )}
        <PostingTable
          apiUrl={apiUrl}
          hasPublishRight={hasPublishRight}
          models={models}
          isPublic={isPublic}
          disabled={!origins?.length}
        />
        {!isPublic && (
          <Button
            type="primary"
            disabled={isSaveDisabled || !onPublicUpdate}
            onClick={handleSave}
            loading={updateLoading}>
            {t("Save changes")}
          </Button>
        )}
      </Form>
    </ContentSection>
  );
};

export default PostingComponent;

const Paragraph = styled.p`
  color: ${AntdColor.GREY.GREY_2};
  padding-bottom: ${AntdToken.SPACING.BASE}px;
`;
