import styled from "@emotion/styled";
import { useState, useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import { ExtendedColumns, Operator } from "@reearth-cms/components/molecules/Content/Table/types";
import { TimeOperator } from "@reearth-cms/components/molecules/View/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";

import filterOptionsGet from "./filterOptionsGet";
import ValueField from "./ValueField";
import valueOptionsGet from "./valueOptionsGet";

type Props = {
  options?: {
    column: ExtendedColumns;
    value: any;
    label: any;
  }[];
  members?: Member[];
};

const AdvancedFilterField: React.FC<Props> = ({ options, members }: Props) => {
  const [isShowInputField, setIsShowInputField] = useState(true);

  const [selectedColumn, setSelectedColumn] = useState<ExtendedColumns>();

  const filterOptions = filterOptionsGet(true, selectedColumn);
  const valueOptions = valueOptionsGet(members, selectedColumn);

  const onColumnSelect = useCallback((_: any, option: { column: ExtendedColumns }) => {
    setSelectedColumn(option.column);
  }, []);

  const onFilterSelect = useCallback((value: Operator, option: { operatorType: string }) => {
    if (
      option.operatorType === "nullable" ||
      value === TimeOperator.OfThisWeek ||
      value === TimeOperator.OfThisMonth ||
      value === TimeOperator.OfThisYear
    ) {
      setIsShowInputField(false);
    } else {
      setIsShowInputField(true);
    }
  }, []);

  return (
    <Space style={{ display: "flex" }}>
      <CustomFormItem>
        <Select
          style={{ width: 170 }}
          options={options}
          onSelect={onColumnSelect}
          getPopupContainer={trigger => trigger.parentNode}
        />
      </CustomFormItem>
      <CustomFormItem>
        <Select
          style={{ width: 170 }}
          options={filterOptions}
          onSelect={onFilterSelect}
          getPopupContainer={trigger => trigger.parentNode}
        />
      </CustomFormItem>
      {isShowInputField && (
        <CustomFormItem>
          {<ValueField type={selectedColumn?.type} options={valueOptions} />}
        </CustomFormItem>
      )}
    </Space>
  );
};

const CustomFormItem = styled(Form.Item)`
  margin: 0;
`;

export default AdvancedFilterField;
