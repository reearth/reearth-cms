import styled from "@emotion/styled";
import { ChangeEvent, useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

type FormValues = {
  content: string;
};

type EditorProps = {
  isInputDisabled: boolean;
  onCommentCreate: (content: string) => Promise<void>;
};

const Editor: React.FC<EditorProps> = ({ isInputDisabled, onCommentCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [form] = Form.useForm<FormValues>();
  const t = useT();

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setIsSubmitDisabled(!e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setIsSubmitDisabled(true);
    try {
      const values = await form.validateFields();
      await onCommentCreate(values.content);
      form.resetFields();
    } catch (_) {
      setIsSubmitDisabled(false);
    } finally {
      setSubmitting(false);
    }
  }, [form, onCommentCreate]);

  return (
    <Form form={form}>
      <StyledFormItem name="content">
        <TextArea autoSize={{ maxRows: 4 }} disabled={isInputDisabled} onChange={handleChange} />
      </StyledFormItem>
      <ButtonWrapper>
        <Button
          disabled={isSubmitDisabled}
          loading={submitting}
          onClick={handleSubmit}
          size="small"
          type="primary">
          {t("Comment")}
        </Button>
      </ButtonWrapper>
    </Form>
  );
};

export default Editor;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 14px;
`;
const ButtonWrapper = styled.div`
  padding-right: 4px;
  text-align: right;
`;
