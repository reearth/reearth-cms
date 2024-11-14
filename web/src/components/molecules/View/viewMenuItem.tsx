import styled from "@emotion/styled";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import { View } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  view: View;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onViewRenameModalOpen: (view: View) => void;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onDelete: (viewId: string) => Promise<void>;
};

const ViewsMenuItem: React.FC<Props> = ({
  view,
  hasUpdateRight,
  hasDeleteRight,
  onViewRenameModalOpen,
  onUpdate,
  onDelete,
}) => {
  const t = useT();

  const children = [
    {
      label: t("Update View"),
      key: "update",
      icon: <Icon icon="reload" />,
      onClick: () => onUpdate(view.id, view.name),
      disabled: !hasDeleteRight,
    },
    {
      label: t("Rename"),
      key: "rename",
      icon: <Icon icon="edit" />,
      onClick: () => onViewRenameModalOpen(view),
      disabled: !hasUpdateRight,
    },
    {
      label: t("Remove View"),
      key: "remove",
      icon: <Icon icon="delete" />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: t("Are you sure you want to delete this view?"),
          content: (
            <div>
              <StyledCautionText>
                {t(
                  "Deleting the view is a permanent action. However, the contents will remain unaffected.",
                )}
              </StyledCautionText>
              <StyledCautionText>
                {t("Please proceed with caution as this action cannot be undone.")}
              </StyledCautionText>
            </div>
          ),
          icon: <Icon icon="exclamationCircle" />,
          okText: t("Remove"),
          okButtonProps: { danger: true },
          maskClosable: true,
          async onOk() {
            await onDelete(view.id);
          },
        });
      },
      disabled: !hasUpdateRight,
    },
  ];

  return (
    <Wrapper>
      {view.name}
      <StyledDropdown trigger={["click"]} menu={{ items: children }}>
        <Icon icon="more" size={16} />
      </StyledDropdown>
    </Wrapper>
  );
};

export default ViewsMenuItem;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const StyledDropdown = styled(Dropdown)`
  margin-right: 0 !important;
`;

const StyledCautionText = styled.p`
  margin-bottom: 0;
`;
