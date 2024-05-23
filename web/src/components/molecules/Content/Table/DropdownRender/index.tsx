import styled from "@emotion/styled";
import { Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ConditionInput, CurrentView } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";
import ValueField from "./ValueField";

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
            defaultValue={defaultValue?.operator ?? options[0].value}
            getPopupContainer={trigger => trigger.parentNode}
          />
        </StyledFormItem>
        {isFilter && isShowInputField && (
          <StyledFormItem name="value">
            {
              <ValueField
                type={filter.type}
                defaultValue={defaultValue?.value}
                options={valueOptions}
                onSelect={onValueSelect}
                onNumberChange={onNumberChange}
                onDateChange={onDateChange}
                onInputChange={onInputChange}
              />
            }
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
  text-align: left;
`;

const StyledDivider = styled(Divider)`
  margin: 0;
`;

const ButtonsFormItem = styled(Form.Item)`
  text-align: right;
  padding: 8px 4px;
`;
