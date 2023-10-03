import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Menu from "@reearth-cms/components/atoms/Menu";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

const ViewsMenu: React.FC = () => {
  const t = useT();
  const { confirm } = Modal;
  const [form] = Form.useForm<{ viewName: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("default");

  const handleUpdate = (e: any) => {
    console.log(e);
  };

  const handleRename = (e: any) => {
    console.log(e);
  };

  const handleRemove = (e: any) => {
    confirm({
      title: t("Are you sure you want to delete this view?"),
      content: (
        <div>
          <p style={{ marginBottom: 0 }}>
            Deleting the view is a permanent action. However, the contents will remain unaffected.
          </p>
          <p style={{ marginBottom: 0 }}>
            Please proceed with caution as this action cannot be undone.
          </p>
        </div>
      ),
      icon: <Icon icon="exclamationCircle" />,
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk() {
        console.log(e);
      },
    });
  };

  const children = [
    {
      label: "Update View",
      key: "update",
      icon: <Icon icon="reload" />,
      onClick: handleUpdate,
    },
    {
      label: "Rename",
      key: "rename",
      icon: <Icon icon="edit" />,
      onClick: handleRename,
    },
    {
      label: "Remove View",
      key: "remove",
      icon: <Icon icon="delete" />,
      danger: true,
      onClick: handleRemove,
    },
  ];

  const handleSelectView: MenuProps["onClick"] = (e: any) => {
    setSelectedView(e.key);
  };

  const defaultView = {
    label: (
      <StyledDropdownButton
        trigger={["click"]}
        type="text"
        icon={<Icon icon="more" />}
        menu={{ items: children }}>
        Default View
      </StyledDropdownButton>
    ),
    key: "default",
  };
  const [filters, setFilters] = useState<any>([defaultView]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setFilters((prevFilters: any) => {
      const viewName = form.getFieldValue("view-name");
      return [
        ...prevFilters,
        {
          label: (
            <StyledDropdownButton
              trigger={["click"]}
              type="text"
              key={viewName}
              icon={<Icon icon="more" />}
              menu={{ items: children }}>
              {viewName}
            </StyledDropdownButton>
          ),
          key: viewName,
        },
      ];
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <StyledMenu
          mode="horizontal"
          expandIcon={<Icon />}
          overflowedIndicator={<Button>All Views</Button>}
          triggerSubMenuAction="click"
          selectedKeys={[selectedView]}
          items={filters}
          onClick={handleSelectView}
        />
        <Button type="text" style={{ color: "rgba(0, 0, 0, 0.25)" }} onClick={showModal}>
          Save as new view
        </Button>
      </div>
      <Modal title="New View" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="view-name"
            label="View Name"
            extra="This is the title of the view"
            rules={[{ required: true, message: "Please input the view name!" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const StyledMenu = styled(Menu)`
  flex: 1;
`;

const StyledDropdownButton = styled(Dropdown.Button)`
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default ViewsMenu;
