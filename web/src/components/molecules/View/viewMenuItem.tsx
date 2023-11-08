import styled from "@emotion/styled";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import { View } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  view: View;
  onViewRenameModalOpen?: (view: View) => void;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onDelete: (viewId: string) => void;
  onViewDeletionClose: () => void;
};

const ViewsMenuItem: React.FC<Props> = ({
  view,
  onViewRenameModalOpen,
  onUpdate,
  onDelete,
  onViewDeletionClose,
}) => {
  const t = useT();

  const children = [
    {
      label: t("Update View"),
      key: "update",
      icon: <Icon icon="reload" />,
      onClick: () => onUpdate?.(view.id, view.name),
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
  );
};

export default ViewsMenuItem;

const StyledDropdownButton = styled(Dropdown.Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  .ant-btn-compact-first-item {
    padding: 0px;
  }
  .ant-btn-compact-last-item {
    height: 16px;
    width: 16px;
  }
  .ant-btn-icon-only {
    display: flex;
    align-items: center;
  }
`;
