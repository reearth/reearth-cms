import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const { TextArea } = Input;

type EditorProps = {
  onCommentCreate: (content: string) => Promise<void>;
};

export const Editor: React.FC<EditorProps> = ({ onCommentCreate }) => {
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
    <Form form={form} layout="vertical">
      <Form.Item name="content">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" loading={submitting} onClick={handleSubmit} type="primary">
          {t("Add Comment")}
        </Button>
      </Form.Item>
    </Form>
  );
};
