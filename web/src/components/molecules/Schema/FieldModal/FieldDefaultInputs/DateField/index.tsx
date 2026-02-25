import styled from "@emotion/styled";
import React from "react";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

type Props = {
  multiple: boolean;
};

const DateField: React.FC<Props> = ({ multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <MultiValueField
          type="date"
          FieldInput={StyledDatePicker}
          data-testid={DATA_TEST_ID.FieldModal__DateInput}
        />
      ) : (
        <StyledDatePicker data-testid={DATA_TEST_ID.FieldModal__DateInput} />
      )}
    </Form.Item>
  );
};

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;

export default DateField;
