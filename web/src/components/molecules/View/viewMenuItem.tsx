import styled from "@emotion/styled";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import { View } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  onDelete: (viewId: string) => Promise<void>;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onViewRenameModalOpen: (view: View) => void;
  view: View;
};

const ViewsMenuItem: React.FC<Props> = ({
  hasDeleteRight,
  hasUpdateRight,
  onDelete,
  onUpdate,
  onViewRenameModalOpen,
  view,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const children = [
    {
      disabled: !hasDeleteRight,
      icon: <Icon icon="reload" />,
      key: "update",
      label: t("Update View"),
      onClick: () => onUpdate(view.id, view.name),
    },
    {
      disabled: !hasUpdateRight,
      icon: <Icon icon="edit" />,
      key: "rename",
      label: t("Rename"),
      onClick: () => onViewRenameModalOpen(view),
    },
    {
      danger: true,
      disabled: !hasUpdateRight,
      icon: <Icon icon="delete" />,
      key: "remove",
      label: t("Remove View"),
      onClick: () => {
        confirm({
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
          maskClosable: true,
          okButtonProps: { danger: true },
          okText: t("Remove"),
          async onOk() {
            await onDelete(view.id);
          },
          title: t("Are you sure you want to delete this view?"),
        });
      },
    },
  ];

  return (
    <Wrapper>
      {view.name}
      <StyledDropdown menu={{ items: children }} trigger={["click"]}>
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
