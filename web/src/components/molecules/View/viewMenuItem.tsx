import styled from "@emotion/styled";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import { View } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  view: View;
  onViewUpdateModalOpen?: (view: View) => void;
  onViewRenameModalOpen?: (view: View) => void;
  onDelete: (viewId: string) => void;
  onViewDeletionClose: () => void;
};

const ViewsMenuItem: React.FC<Props> = ({
  view,
  onViewUpdateModalOpen,
  onViewRenameModalOpen,
  onDelete,
  onViewDeletionClose,
}) => {
  const t = useT();

  const children = [
    {
      label: t("Update View"),
      key: "update",
      icon: <Icon icon="reload" />,
      onClick: () => onViewUpdateModalOpen?.(view),
    },
    {
      label: t("Rename"),
      key: "rename",
      icon: <Icon icon="edit" />,
      onClick: () => onViewRenameModalOpen?.(view),
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
              <p style={{ marginBottom: 0 }}>
                {t(
                  "Deleting the view is a permanent action. However, the contents will remain unaffected.",
                )}
              </p>
              <p style={{ marginBottom: 0 }}>
                {t("Please proceed with caution as this action cannot be undone.")}
              </p>
            </div>
          ),
          icon: <Icon icon="exclamationCircle" />,
          okText: t("Remove"),
          okButtonProps: { danger: true },
          onOk() {
            onDelete(view.id);
          },
          onCancel() {
            onViewDeletionClose();
          },
        });
      },
    },
  ];

  return (
    <StyledDropdownButton
      trigger={["click"]}
      type="text"
      icon={<Icon icon="more" />}
      menu={{ items: children }}>
      {t(view.name)}
    </StyledDropdownButton>
  )};

export default ViewsMenuItem;

const StyledDropdownButton = styled(Dropdown.Button)`
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
