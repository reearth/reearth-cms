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
  close: () => void;
  currentView: CurrentView;
  defaultValue?: DefaultFilterValueType;
  filter: DropdownFilterType;
  index: number;
  isFilter: boolean;
  onFilterChange: (filter?: ConditionInput[]) => void;
  open: boolean;
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
};

const DropdownRender: React.FC<Props> = ({
  close,
  currentView,
  defaultValue,
  filter,
  index,
  isFilter,
  onFilterChange,
  open,
  setCurrentView,
}) => {
  const t = useT();

  const {
    confirm,
    form,
    isShowInputField,
    onDateChange,
    onFilterSelect,
    onInputChange,
    onNumberChange,
    onValueSelect,
    options,
    valueOptions,
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
    <StyledForm autoComplete="off" colon={false} form={form} name="basic">
      <Container>
        <StyledFormItem label={<TextWrapper>{filter.title}</TextWrapper>} name="condition">
          <Select
            defaultValue={options[0].value}
            getPopupContainer={trigger => trigger.parentNode}
            onSelect={onFilterSelect}
            options={options}
            style={{ width: 160 }}
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
                getPopupContainer={trigger => trigger.parentNode}
                onSelect={onValueSelect}
                placeholder="Select the value">
                {valueOptions.map(option => (
                  <Option key={option.value} label={option.label} value={option.value}>
                    {filter.type === "Tag" ? (
                      <Tag color={option.color?.toLocaleLowerCase()}>{option.label}</Tag>
                    ) : (
                      option.label
                    )}
                  </Option>
                ))}
              </Select>
            ) : filter.type === "Integer" || filter.type === "Number" ? (
              <InputNumber onChange={onNumberChange} placeholder="Enter the value" stringMode />
            ) : filter.type === "Date" ? (
              <DatePicker
                onChange={onDateChange}
                placeholder="Select the date"
                showNow={false}
                style={{ width: "100%" }}
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
          <Button onClick={close} type="default">
            {t("Cancel")}
          </Button>
          <Button htmlType="submit" onClick={confirm} type="primary">
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
