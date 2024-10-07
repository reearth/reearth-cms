import styled from "@emotion/styled";
import { useCallback, useState, ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasCommentCreateRight: boolean;
  onCommentCreate: (content: string) => Promise<void>;
};

const RequestEditor: React.FC<Props> = ({ hasCommentCreateRight, onCommentCreate }) => {
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
    <Form form={form} layout="vertical">
      <TextAreaItem name="content">
        <TextArea
          rows={4}
          placeholder={t("Leave your comment...")}
          onChange={handleChange}
          disabled={!hasCommentCreateRight}
        />
      </TextAreaItem>
      <ButtonItem>
        <Button disabled={isDisabled} loading={submitting} onClick={handleSubmit} type="primary">
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
