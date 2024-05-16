import styled from "@emotion/styled";
import { ItemType } from "antd/lib/menu/hooks/useItems";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import { useT } from "@reearth-cms/i18n";

type Props = { items?: (ItemType & { type: string; label: string })[] };

const AdvancedFilter: React.FC<Props> = ({ items }: Props) => {
  const t = useT();
  const options = items?.map(item => ({ value: item.type, label: item.label }));

  return (
    <StyledForm name="basic" autoComplete="off" colon={false}>
      <Container>
        <div>Advanced Filter</div>
        <Form.List name="filter">
          {(fields, { add }) => (
            <>
              <Space style={{ display: "flex" }}>
                <CustomFormItem name={"column"}>
                  <Select
                    style={{ width: 170 }}
                    options={options}
                    getPopupContainer={trigger => trigger.parentNode}
                  />
                </CustomFormItem>
                <CustomFormItem name={"condition"}>
                  <Select
                    style={{ width: 170 }}
                    options={options}
                    getPopupContainer={trigger => trigger.parentNode}
                  />
                </CustomFormItem>
                <CustomFormItem name={"value"}>
                  <Input placeholder="Value" />
                </CustomFormItem>
              </Space>
              {fields.map(({ key, name, ...restField }) => (
                <>
                  <CustomFormItem {...restField} name={"logic"}>
                    <Select
                      style={{ width: 150 }}
                      options={[
                        { label: "AND", value: "AND" },
                        { label: "OR", value: "OR" },
                      ]}
                      defaultValue={"AND"}
                      getPopupContainer={trigger => trigger.parentNode}
                    />
                  </CustomFormItem>
                  <Space key={key} style={{ display: "flex" }}>
                    <CustomFormItem {...restField} name={[name, "column"]}>
                      <Select
                        style={{ width: 170 }}
                        options={options}
                        getPopupContainer={trigger => trigger.parentNode}
                      />
                    </CustomFormItem>
                    <CustomFormItem {...restField} name={[name, "condition"]}>
                      <Select
                        style={{ width: 170 }}
                        options={options}
                        getPopupContainer={trigger => trigger.parentNode}
                      />
                    </CustomFormItem>
                    <CustomFormItem {...restField} name={[name, "value"]}>
                      <Input placeholder="Value" />
                    </CustomFormItem>
                  </Space>
                </>
              ))}
              <Form.Item>
                <Button type="primary" icon={<Icon icon="plus" />} onClick={() => add()}>
                  {t("New Filter")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Container>
      <StyledDivider />
      <ButtonsFormItem>
        <Button type="primary" htmlType="submit">
          {t("OK")}
        </Button>
      </ButtonsFormItem>
    </StyledForm>
  );
};

export default AdvancedFilter;

const StyledForm = styled(Form)`
  background-color: white;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const Container = styled.div`
  padding: 9px 12px 0;
`;

const StyledDivider = styled(Divider)`
  margin: 0;
`;

const CustomFormItem = styled(Form.Item)`
  margin: 0;
`;

const ButtonsFormItem = styled(Form.Item)`
  text-align: right;
  padding: 8px 4px;
`;
