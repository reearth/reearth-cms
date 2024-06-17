import styled from "@emotion/styled";
import { useCallback, useState, ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const { TextArea } = Input;

interface Props {
  onCommentCreate: (content: string) => Promise<void>;
}

const RequestEditor: React.FC<Props> = ({ onCommentCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [form] = Form.useForm();
  const t = useT();

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setIsDisabled(!e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onCommentCreate?.(values.content);
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setSubmitting(false);
    }
  }, [form, onCommentCreate]);

  return (
    <StyledForm form={form} layout="vertical">
      <Form.Item name="content">
        <TextArea rows={4} maxLength={1000} showCount onChange={handleChange} />
      </Form.Item>
      <StyledFormItem>
        <Button disabled={isDisabled} loading={submitting} onClick={handleSubmit} type="primary">
          {t("Comment")}
        </Button>
      </StyledFormItem>
    </StyledForm>
  );
};

export default RequestEditor;

const StyledForm = styled(Form)`
  padding: 0 12px;
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0 4px 4px 0;
  float: right;
`;
