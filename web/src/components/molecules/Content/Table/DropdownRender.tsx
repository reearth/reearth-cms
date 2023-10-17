import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import { useT } from "@reearth-cms/i18n";

type Props = {
  filter: string;
};

const DropdownRender: React.FC<Props> = ({ filter }) => {
  const t = useT();

  const options = [
    { value: "is", label: t("is") },
    { value: "is not", label: t("is not") },
    { value: "contains", label: t("contains") },
    { value: "doesn't contain", label: t("doesn't contain") },
    { value: "is empty", label: t("is empty") },
    { value: "is not empty", label: t("is not empty") },
  ];

  return (
    <Container>
      <Form name="basic" autoComplete="off">
        <Form.Item label={filter} name="condition">
          <Select style={{ width: 160 }} options={options} />
        </Form.Item>
        <Form.Item>
          <Input />
        </Form.Item>
        <Form.Item style={{ textAlign: "right" }}>
          <Space size="small">
            <Button type="default" style={{ marginRight: 10 }}>
              {t("Cancel")}
            </Button>
            <Button type="primary" htmlType="submit">
              {t("Confirm")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  padding: 10px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

export default DropdownRender;
