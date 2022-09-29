import { Button, Form, Input } from "antd";

type EditorProps = {
  onChange: any;
  onSubmit: any;
  submitting: any;
  value: any;
};

export const Editor: React.FC<EditorProps> = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </>
);
