import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const { TextArea } = Input;

type EditorProps = {
  onChange: any;
  onSubmit: any;
  submitting: any;
  value: any;
};

export const Editor: React.FC<EditorProps> = ({ onChange, onSubmit, submitting, value }) => {
  const t = useT();
  return (
    <>
      <Form.Item>
        <TextArea rows={4} onChange={onChange} value={value} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
          {t("Add Comment")}
        </Button>
      </Form.Item>
    </>
  );
};
