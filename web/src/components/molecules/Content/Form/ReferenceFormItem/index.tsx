import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import LinkItemModal from "@reearth-cms/components/molecules/Content/LinkItemModal";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../../types";

type Props = {
  linkedItemsModalList?: FormItem[];
  className?: string;
  value?: string;
  correspondingFieldId: string;
  modelId?: string;
  formItemsData?: FormItem[];
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onChange?: (value?: string) => void;
};

const ReferenceFormItem: React.FC<Props> = ({
  linkedItemsModalList,
  value,
  correspondingFieldId,
  onChange,
  modelId,
  formItemsData,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onLinkItemTableChange,
}) => {
  const { workspaceId, projectId } = useParams();

  const t = useT();
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<FormItem | undefined>();

  const handleClick = useCallback(() => {
    onReferenceModelUpdate(modelId);
    setVisible(true);
  }, [setVisible, onReferenceModelUpdate, modelId]);

  const handleLinkItemModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    const item = [...(linkedItemsModalList ?? []), ...(formItemsData ?? [])]?.find(
      item => item.id === value,
    );
    setCurrentItem(item);
  }, [linkedItemsModalList, formItemsData, value]);

  return (
    <>
      {value && (
        <ReferenceItemWrapper>
          <ReferenceItem
            value={value}
            status={currentItem?.status}
            workspaceId={workspaceId}
            projectId={projectId}
            modelId={modelId}
          />
          <Button
            type="link"
            icon={<Icon icon={"unlinkSolid"} size={16} />}
            onClick={() => {
              onChange?.();
            }}
          />
        </ReferenceItemWrapper>
      )}
      <StyledButton onClick={handleClick} type="primary">
        <Icon icon="arrowUpRight" size={14} /> {t("Refer to item")}
      </StyledButton>

      <LinkItemModal
        linkItemModalTotalCount={linkItemModalTotalCount}
        linkItemModalPage={linkItemModalPage}
        correspondingFieldId={correspondingFieldId}
        linkItemModalPageSize={linkItemModalPageSize}
        onLinkItemTableChange={onLinkItemTableChange}
        linkedItemsModalList={linkedItemsModalList}
        visible={visible}
        onLinkItemModalCancel={handleLinkItemModalCancel}
        linkedItem={value}
        onChange={onChange}
      />
    </>
  );
};

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  margin-top: 4px;
  > span {
    padding: 4px;
  }
`;

const ReferenceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default ReferenceFormItem;
