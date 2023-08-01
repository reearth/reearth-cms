import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import LinkItemModal from "@reearth-cms/components/molecules/Content/LinkItemModal";
import { useT } from "@reearth-cms/i18n";

import { linkedItemsModalField } from "../../types";

type Props = {
  linkedItemsModalList?: linkedItemsModalField[];
  className?: string;
  value?: string;
  onChange?: (value?: string) => void;
};

const ReferenceItem: React.FC<Props> = ({ linkedItemsModalList, value, onChange }) => {
  const { workspaceId, projectId, modelId } = useParams();

  const t = useT();
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<linkedItemsModalField | undefined>();

  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleLinkItemModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    const item = linkedItemsModalList?.find(item => item.id === value);
    setCurrentItem(item);
    console.log(item);
  }, [linkedItemsModalList, value]);

  return (
    <>
      {value && (
        <ReferenceItemWrapper>
          <StyledReferenceItem>
            <Tooltip>
              <Link
                to={`/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details/${value}`}
                target="_blank">
                <ReferenceItemName>{value}</ReferenceItemName>
              </Link>
            </Tooltip>
            <Badge
              color={
                currentItem?.status === "PUBLIC"
                  ? "#52C41A"
                  : currentItem?.status === "REVIEW"
                  ? "#F5222D"
                  : currentItem?.status === "DRAFT"
                  ? "#BFBFBF"
                  : ""
              }
            />
          </StyledReferenceItem>
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

const StyledReferenceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  justify-content: space-between;
  flex: 1;
`;

const ReferenceItemName = styled.p`
  margin: 0;
  color: #1890ff;
`;

export default ReferenceItem;
