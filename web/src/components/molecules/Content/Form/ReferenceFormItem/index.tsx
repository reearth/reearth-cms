import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import LinkItemModal from "@reearth-cms/components/molecules/Content/LinkItemModal";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import { CorrespondingField } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../../types";

export type ReferenceProps = {
  linkedItemsModalList?: FormItem[];
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  loading?: boolean;
  onCheckItemReference?: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
  onLinkItemTableReload?: () => void;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm?: (term?: string) => void;
  referencedItems: FormItem[];
};

type Props = {
  correspondingField?: CorrespondingField;
  disabled?: boolean;
  fieldId: string;
  itemGroupId?: string;
  modelId?: string;
  onChange?: (value?: string) => void;
  titleFieldId?: null | string;
  value?: string;
} & ReferenceProps;

const ReferenceFormItem: React.FC<Props> = ({
  correspondingField,
  disabled,
  fieldId,
  itemGroupId,
  linkedItemsModalList,
  linkItemModalPage,
  linkItemModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  loading,
  modelId,
  onChange,
  onCheckItemReference,
  onLinkItemTableChange,
  onLinkItemTableReload,
  onReferenceModelUpdate,
  onSearchTerm,
  referencedItems,
  titleFieldId,
  value,
}) => {
  const { projectId, workspaceId } = useParams();

  const t = useT();
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<FormItem>();

  const handleClick = useCallback(() => {
    if (!onReferenceModelUpdate || !modelId) return;
    onReferenceModelUpdate(modelId, titleFieldId ?? "");
    setVisible(true);
  }, [onReferenceModelUpdate, modelId, titleFieldId]);

  const handleLinkItemModalCancel = useCallback(() => {
    if (disabled) return;
    setVisible(false);
  }, [disabled, setVisible]);

  useEffect(() => {
    const item = [...(referencedItems ?? []), ...(linkedItemsModalList ?? [])]?.find(
      item => item.id === value,
    );
    setCurrentItem(item);
  }, [linkedItemsModalList, referencedItems, value]);

  return (
    <>
      {value && (
        <ReferenceItemWrapper>
          <ReferenceItem
            disabled={disabled}
            modelId={modelId}
            projectId={projectId}
            status={currentItem?.status}
            title={currentItem?.title ?? ""}
            value={value}
            workspaceId={workspaceId}
          />
          {!disabled && (
            <UnreferButton
              color="default"
              icon={<Icon icon={"arrowUpRightSlash"} size={16} />}
              onClick={() => {
                onChange?.();
              }}
              variant="link"
            />
          )}
        </ReferenceItemWrapper>
      )}
      {!disabled && (
        <StyledButton onClick={handleClick} type="primary">
          <Icon icon="arrowUpRight" size={14} /> {value ? t("Replace item") : t("Refer to item")}
        </StyledButton>
      )}
      {!!onSearchTerm &&
        !!onLinkItemTableReload &&
        !!onLinkItemTableChange &&
        !!onCheckItemReference && (
          <LinkItemModal
            correspondingField={correspondingField}
            fieldId={fieldId}
            itemGroupId={itemGroupId}
            linkedItem={value}
            linkedItemsModalList={linkedItemsModalList}
            linkItemModalPage={linkItemModalPage}
            linkItemModalPageSize={linkItemModalPageSize}
            linkItemModalTitle={linkItemModalTitle}
            linkItemModalTotalCount={linkItemModalTotalCount}
            loading={!!loading}
            onChange={onChange}
            onCheckItemReference={onCheckItemReference}
            onLinkItemModalCancel={handleLinkItemModalCancel}
            onLinkItemTableChange={onLinkItemTableChange}
            onLinkItemTableReload={onLinkItemTableReload}
            onSearchTerm={onSearchTerm}
            visible={visible}
          />
        )}
    </>
  );
};

const UnreferButton = styled(Button)`
  color: #000000d9;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
`;

const ReferenceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export default ReferenceFormItem;
