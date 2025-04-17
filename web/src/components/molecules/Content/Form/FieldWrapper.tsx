import styled from "@emotion/styled";
import { useMemo } from "react";

import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field as FieldType, Group } from "@reearth-cms/components/molecules/Schema/types";

import Field from "./Field";

type Props = {
  field: FieldType;
  disabled: boolean;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
  assetProps: AssetProps;
  referenceProps: ReferenceProps;
  groupProps: {
    form: FormInstance<unknown>;
    onGroupGet: (id: string) => Promise<Group | undefined>;
  };
};

const FieldWrapper: React.FC<Props> = ({
  field,
  disabled,
  itemHeights,
  onItemHeightChange,
  assetProps,
  referenceProps,
  groupProps,
}) => {
  const isFullWidth = useMemo(
    () =>
      field.type === "Group" || field.type === "GeometryObject" || field.type === "GeometryEditor",
    [field.type],
  );

  return (
    <Wrapper key={field.id} isFullWidth={isFullWidth}>
      <Field
        field={field}
        disabled={disabled}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        assetProps={assetProps}
        referenceProps={referenceProps}
        groupProps={groupProps}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ isFullWidth?: boolean }>`
  max-width: ${({ isFullWidth }) => (isFullWidth ? undefined : "500px")};
  word-wrap: break-word;
`;

export default FieldWrapper;
