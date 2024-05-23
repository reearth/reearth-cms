import styled from "@emotion/styled";
import { ItemType } from "antd/lib/menu/hooks/useItems";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Select from "@reearth-cms/components/atoms/Select";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import AdvancedFilterField from "./AdvancedFilterField";

type Props = {
  items?: (ItemType & { column: ExtendedColumns })[];
  members?: Member[];
};

const AdvancedFilter: React.FC<Props> = ({ items, members }: Props) => {
  const t = useT();
  const options = items?.map(item => ({
    column: item.column,
    value:
      typeof item.column.title === "string"
        ? item.column.title
        : (item.column.title as any).props.children[0],
    label: item.column.title,
  }));

  return (
    <StyledForm name="basic" autoComplete="off" colon={false}>
      <Container>
        <div>Advanced Filter</div>
        <Form.List name="filter">
          {(fields, { add }) => (
            <>
              <AdvancedFilterField options={options} members={members} />
              {fields.map(({ key }) => (
                <div key={key}>
                  <CustomFormItem>
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
                  <AdvancedFilterField options={options} members={members} />
                </div>
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
