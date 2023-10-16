import styled from "@emotion/styled";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { View } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  view: View;
  onViewUpdateModalOpen?: (view: View) => void;
  onViewRenameModalOpen?: (view: View) => void;
  onViewDeletionModalOpen?: (view: View) => void;
};

const ViewsMenuItem: React.FC<Props> = ({
  view,
  onViewUpdateModalOpen,
  onViewRenameModalOpen,
  onViewDeletionModalOpen,
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
      onClick: () => onViewDeletionModalOpen?.(view),
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
