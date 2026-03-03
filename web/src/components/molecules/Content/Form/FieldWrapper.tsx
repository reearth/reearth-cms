import styled from "@emotion/styled";
import { useMemo } from "react";

import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field as FieldType, Group } from "@reearth-cms/components/molecules/Schema/types";

import Field from "./Field";

type Props = {
  assetProps: AssetProps;
  disabled: boolean;
  field: FieldType;
  groupProps: {
    form: FormInstance<unknown>;
    onGroupGet: (id: string) => Promise<Group | undefined>;
  };
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
  referenceProps: ReferenceProps;
};

const FieldWrapper: React.FC<Props> = ({
  assetProps,
  disabled,
  field,
  groupProps,
  itemHeights,
  onItemHeightChange,
  referenceProps,
}) => {
  const isFullWidth = useMemo(
    () =>
      field.type === "Group" || field.type === "GeometryObject" || field.type === "GeometryEditor",
    [field.type],
  );

  return (
    <Wrapper isFullWidth={isFullWidth} key={field.id}>
      <Field
        assetProps={assetProps}
        disabled={disabled}
        field={field}
        groupProps={groupProps}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        referenceProps={referenceProps}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ isFullWidth?: boolean }>`
  max-width: ${({ isFullWidth }) => (isFullWidth ? undefined : "500px")};
  word-wrap: break-word;
`;

export default FieldWrapper;
