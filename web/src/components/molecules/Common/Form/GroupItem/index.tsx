import styled from "@emotion/styled";
import { useCallback, useMemo, MouseEvent, useState, useEffect } from "react";

import Collapse from "@reearth-cms/components/atoms/Collapse";
import Icon from "@reearth-cms/components/atoms/Icon";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import {
  AssetField,
  ReferenceField,
} from "@reearth-cms/components/molecules/Content/Form/fields/ComplexFieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "@reearth-cms/components/molecules/Content/Form/fields/FieldTypesMap";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field, Group, GroupField } from "@reearth-cms/components/molecules/Schema/types";

const { Panel } = Collapse;

type Props = {
  value?: string;
  disabled: boolean;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
  parentField: Field;
  order?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  assetProps: AssetProps;
  referenceProps: ReferenceProps;
};

const GroupItem: React.FC<Props> = ({
  value,
  disabled,
  itemHeights,
  onItemHeightChange,
  parentField,
  order,
  onMoveUp,
  onMoveDown,
  onDelete,
  disableMoveUp,
  disableMoveDown,
  onGroupGet,
  assetProps,
  referenceProps,
}) => {
  const [fields, setFields] = useState<GroupField[]>();

  useEffect(() => {
    const handleFieldsSet = async (id: string) => {
      const group = await onGroupGet(id);
      setFields(group?.schema.fields);
    };

    if (parentField?.typeProperty?.groupId) handleFieldsSet(parentField.typeProperty.groupId);
  }, [onGroupGet, parentField?.typeProperty?.groupId]);

  const itemGroupId = useMemo(() => value ?? "", [value]);

  const handleMoveUp = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onMoveUp?.();
      e.stopPropagation();
    },
    [onMoveUp],
  );

  const handleMoveDown = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onMoveDown?.();
      e.stopPropagation();
    },
    [onMoveDown],
  );

  const handleDelete = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onDelete?.();
      e.stopPropagation();
    },
    [onDelete],
  );

  return (
    <StyledCollapse defaultActiveKey={["1"]}>
      <Panel
        header={parentField?.title + (order !== undefined ? ` (${order + 1})` : "")}
        key="1"
        extra={
          !disabled &&
          order !== undefined && (
            <>
              <IconWrapper disabled={disableMoveUp} onClick={handleMoveUp}>
                <Icon icon="arrowUp" />
              </IconWrapper>
              <IconWrapper disabled={disableMoveDown} onClick={handleMoveDown}>
                <Icon icon="arrowDown" />
              </IconWrapper>
              <IconWrapper onClick={handleDelete}>
                <Icon icon="delete" />
              </IconWrapper>
            </>
          )
        }>
        <div>
          {fields?.map(field => {
            if (field.type === "Asset") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <AssetField
                    field={field}
                    disabled={disabled}
                    itemGroupId={itemGroupId}
                    itemHeights={itemHeights}
                    onItemHeightChange={onItemHeightChange}
                    {...assetProps}
                  />
                </StyledFormItemWrapper>
              );
            } else if (field.type === "Reference") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <ReferenceField
                    field={field}
                    disabled={disabled}
                    itemGroupId={itemGroupId}
                    itemHeights={itemHeights}
                    onItemHeightChange={onItemHeightChange}
                    {...referenceProps}
                  />
                </StyledFormItemWrapper>
              );
            } else {
              const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
              return (
                <StyledFormItemWrapper
                  key={field.id}
                  isFullWidth={field.type === "GeometryObject" || field.type === "GeometryEditor"}>
                  <FieldComponent
                    field={field}
                    itemGroupId={itemGroupId}
                    disabled={disabled}
                    itemHeights={itemHeights}
                    onItemHeightChange={onItemHeightChange}
                  />
                </StyledFormItemWrapper>
              );
            }
          })}
        </div>
      </Panel>
    </StyledCollapse>
  );
};

const StyledCollapse = styled(Collapse)`
  width: 100%;
`;

const IconWrapper = styled.span<{ disabled?: boolean }>`
  margin-right: 10px;
  display: ${({ disabled }) => (disabled ? "none" : "inline-block")};
`;

const StyledFormItemWrapper = styled.div<{ isFullWidth?: boolean }>`
  max-width: ${({ isFullWidth }) => (isFullWidth ? undefined : "468px")};
  word-wrap: break-word;
`;

export default GroupItem;
