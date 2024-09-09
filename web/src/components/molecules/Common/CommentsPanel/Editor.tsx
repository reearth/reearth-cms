import styled from "@emotion/styled";
import { useCallback, useState, ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

type EditorProps = {
  isInputDisabled: boolean;
  onCommentCreate: (content: string) => Promise<void>;
};

const Editor: React.FC<EditorProps> = ({ isInputDisabled, onCommentCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [form] = Form.useForm();
  const t = useT();

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setIsSubmitDisabled(!e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setIsSubmitDisabled(true);
    try {
      const values = await form.validateFields();
      await onCommentCreate?.(values.content);
      form.resetFields();
    } catch (_) {
      setIsSubmitDisabled(false);
    } finally {
      setSubmitting(false);
    }
  }, [form, onCommentCreate]);

  return (
    <StyledForm form={form} layout="vertical">
      <Form.Item name="content">
        <TextArea
          maxLength={1000}
          showCount
          autoSize={{ maxRows: 4 }}
          onChange={handleChange}
          disabled={isInputDisabled}
        />
      </Form.Item>
      <StyledFormItem>
        <Button
          disabled={isSubmitDisabled}
          loading={submitting}
          onClick={handleSubmit}
          type="primary"
          size="small">
          {t("Comment")}
        </Button>
      </StyledFormItem>
    </StyledForm>
  );
};

export default Editor;

const StyledForm = styled(Form)`
  padding: 12px;
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0 4px 4px 0;
  float: right;
`;
