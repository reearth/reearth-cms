import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const { TextArea } = Input;

type EditorProps = {
  onCommentCreate: (content: string) => Promise<void>;
};

const Editor: React.FC<EditorProps> = ({ onCommentCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const t = useT();

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await onCommentCreate?.(values.content);
      form.resetFields();
      setSubmitting(false);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onCommentCreate]);

  return (
    <StyledForm form={form} layout="vertical">
      <Form.Item name="content">
        <TextArea rows={4} maxLength={100} showCount autoSize />
      </Form.Item>
      <StyledFormItem>
        <Button
          htmlType="submit"
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
