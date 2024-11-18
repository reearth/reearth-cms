import styled from "@emotion/styled";
import { Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Tag from "@reearth-cms/components/atoms/Tag";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ConditionInput, CurrentView } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const { Option } = Select;

type Props = {
  filter: DropdownFilterType;
  close: () => void;
  defaultValue?: DefaultFilterValueType;
  open: boolean;
  isFilter: boolean;
  index: number;
  currentView: CurrentView;
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
  onFilterChange: (filter?: ConditionInput[]) => void;
};

const DropdownRender: React.FC<Props> = ({
  filter,
  close,
  defaultValue,
  open,
  isFilter,
  index,
  currentView,
  setCurrentView,
  onFilterChange,
}) => {
  const t = useT();

  const {
    valueOptions,
    options,
    form,
    confirm,
    isShowInputField,
    onFilterSelect,
    onValueSelect,
    onNumberChange,
    onInputChange,
    onDateChange,
  } = useHooks(
    filter,
    close,
    open,
    isFilter,
    index,
    currentView,
    setCurrentView,
    onFilterChange,
    defaultValue,
  );
  return (
    <StyledForm form={form} name="basic" autoComplete="off" colon={false}>
      <Container>
        <StyledFormItem label={<TextWrapper>{filter.title}</TextWrapper>} name="condition">
          <Select
            style={{ width: 160 }}
            options={options}
            onSelect={onFilterSelect}
            defaultValue={options[0].value}
            getPopupContainer={trigger => trigger.parentNode}
          />
        </StyledFormItem>
        {isFilter && isShowInputField && (
          <StyledFormItem name="value">
            {filter.type === "Select" ||
            filter.type === "Tag" ||
            filter.type === "Person" ||
            filter.type === "Bool" ||
            filter.type === "Checkbox" ? (
              <Select
                placeholder="Select the value"
                onSelect={onValueSelect}
                getPopupContainer={trigger => trigger.parentNode}>
                {valueOptions.map(option => (
                  <Option key={option.value} value={option.value} label={option.label}>
                    {filter.type === "Tag" ? (
                      <Tag color={option.color?.toLocaleLowerCase()}>{option.label}</Tag>
                    ) : (
                      option.label
                    )}
                  </Option>
                ))}
              </Select>
            ) : filter.type === "Integer" || filter.type === "Number" ? (
              <InputNumber onChange={onNumberChange} stringMode placeholder="Enter the value" />
            ) : filter.type === "Date" ? (
              <DatePicker
                onChange={onDateChange}
                style={{ width: "100%" }}
                placeholder="Select the date"
                showNow={false}
              />
            ) : (
              <Input onChange={onInputChange} placeholder="Enter the value" />
            )}
          </StyledFormItem>
        )}
      </Container>
      <StyledDivider />
      <ButtonsFormItem>
        <Space size="small">
          <Button type="default" onClick={close}>
            {t("Cancel")}
          </Button>
          <Button type="primary" htmlType="submit" onClick={confirm}>
            {t("Confirm")}
          </Button>
        </Space>
      </ButtonsFormItem>
    </StyledForm>
  );
};

export default DropdownRender;

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

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 8px;
`;

const TextWrapper = styled.span`
  min-width: 137px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

const StyledDivider = styled(Divider)`
  margin: 0;
`;

const ButtonsFormItem = styled(Form.Item)`
  text-align: right;
  padding: 8px 4px;
`;
