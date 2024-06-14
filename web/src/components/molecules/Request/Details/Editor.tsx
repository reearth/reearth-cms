import styled from "@emotion/styled";
import { useCallback, useState } from "react";

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
  const [form] = Form.useForm();
  const t = useT();

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await onCommentCreate?.(values.content);
      form.resetFields();
    } catch (info) {
      console.log("Validate Failed:", info);
    } finally {
      setSubmitting(false);
    }
  }, [form, onCommentCreate]);

  return (
    <Form form={form} layout="vertical">
      <TextAreaItem name="content">
        <TextArea rows={4} placeholder={t("Leave your comment...")} />
      </TextAreaItem>
      <ButtonItem>
        <Button loading={submitting} onClick={handleSubmit} type="primary">
          {t("Add Comment")}
        </Button>
      </ButtonItem>
    </Form>
  );
};

export default RequestEditor;

const TextAreaItem = styled(Form.Item)`
  margin-bottom: 12px;
`;

const ButtonItem = styled(Form.Item)`
  margin: 0px;
  text-align: right;
`;
