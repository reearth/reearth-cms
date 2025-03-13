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
  referencedItems: FormItem[];
  loading?: boolean;
  linkedItemsModalList?: FormItem[];
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm?: (term?: string) => void;
  onLinkItemTableReload?: () => void;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
  onCheckItemReference?: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
};

type Props = {
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  itemGroupId?: string;
  fieldId: string;
  modelId?: string;
  titleFieldId?: string | null;
  correspondingField?: CorrespondingField;
} & ReferenceProps;

const ReferenceFormItem: React.FC<Props> = ({
  value,
  fieldId,
  referencedItems,
  loading,
  linkedItemsModalList,
  disabled,
  itemGroupId,
  correspondingField,
  modelId,
  titleFieldId,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onCheckItemReference,
  onChange,
}) => {
  const { workspaceId, projectId } = useParams();

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
            value={value}
            title={currentItem?.title ?? ""}
            status={currentItem?.status}
            workspaceId={workspaceId}
            projectId={projectId}
            modelId={modelId}
            disabled={disabled}
          />
          {!disabled && (
            <UnreferButton
              color="default"
              variant="link"
              icon={<Icon icon={"arrowUpRightSlash"} size={16} />}
              onClick={() => {
                onChange?.();
              }}
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
            visible={visible}
            loading={!!loading}
            fieldId={fieldId}
            itemGroupId={itemGroupId}
            correspondingField={correspondingField}
            linkedItemsModalList={linkedItemsModalList}
            linkedItem={value}
            linkItemModalTitle={linkItemModalTitle}
            linkItemModalTotalCount={linkItemModalTotalCount}
            linkItemModalPage={linkItemModalPage}
            linkItemModalPageSize={linkItemModalPageSize}
            onSearchTerm={onSearchTerm}
            onLinkItemTableReload={onLinkItemTableReload}
            onLinkItemTableChange={onLinkItemTableChange}
            onLinkItemModalCancel={handleLinkItemModalCancel}
            onChange={onChange}
            onCheckItemReference={onCheckItemReference}
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
